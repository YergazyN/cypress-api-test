/// <reference types="cypress" />

describe('Test with backend', ()=> {
    
    beforeEach('login to the app', () => {
        cy.intercept({method: 'Get', path: '**/tags'}, {fixture: 'tags.json'})
        cy.loginToApplication()
    })

    it('verify correct request and response', ()=> {

        cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('Article One8')
        cy.get('[formcontrolname="description"]').type('Article One Description')
        cy.get('[formcontrolname="body"]').type('Article One Body')
        cy.contains(' Publish Article ').click()
        
        cy.wait('@postArticles').then( xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('Article One Body')
            expect(xhr.request.body.article.description).to.equal('Article One Description') 
        })
    });

    it('intercepting and modifying the request and response', ()=> {

        cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) => {
            req.body.article.description = "Article One Description 2"
        }).as('postArticles')

        

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('Article One5551295')
        cy.get('[formcontrolname="description"]').type('Article One Description')
        cy.get('[formcontrolname="body"]').type('Article One Body')
        cy.contains(' Publish Article ').click()
        
        cy.wait('@postArticles').then( xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('Article One Body')
            expect(xhr.request.body.article.description).to.equal('Article One Description 2') 
        })
    });

    it('verify popular tags are displayed', ()=> {
        cy.get('.tag-list')
        .should('contain', 'cypress')
        .and('contain', 'automation')
        .and('contain', 'testing') 
    });

    it('verify global feed likes count', () => {
       cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', {"articles":[],"articlesCount":0})
       cy.intercept('GET', 'https://api.realworld.io/api/articles*', {fixture: 'articles.json'})
       
       cy.contains('Global Feed').click()
       cy.get('app-article-list button').then(heartList => {
            expect(heartList[0]).to.contain('1')
            expect(heartList[1]).to.contain('5')
       })

       cy.fixture('articles').then(file => {
            const articleLink = file.articles[1].slug
            file.articles[1].favoritesCount = 4
            cy.intercept('POST', 'https://api.realworld.io/api/articles/'+articleLink+'/favorite', file)
       })

       cy.get('app-article-list button').eq(1).click().should('contain', '4')  
    });


    it.only('delete a new article in a global feed', () => {

        const userCredentials = {
            "user": {
                "email": "nurmaganbetov0486@gmail.com",
                "password": "Sabitzer15"
            }
        }

        const bodyRequest = {
            "article": {
                "tagList": [],
                "title": "Request from API 3",
                "description": "API testing is easy",
                "body": "Angular is cool"
            }
        }

        cy.request('POST', 'https://api.realworld.io/api/users/login', userCredentials)
            .its('body').then( body => {
                const token = body.user.token

                cy.request({
                    url: 'https://api.realworld.io/api/articles/', 
                    headers: { 'Authorization': 'Token '+token },
                    method: 'POST',
                    body: bodyRequest 
                }).then( response => {
                    expect(response.status).to.equal(200) 
                });

                cy.contains('Global Feed').click()
                cy.get('.article-preview').first().click()
                cy.get('.article-actions').contains('Delete Article').click()

                cy.request({
                        url: 'https://api.realworld.io/api/articles?limit=10&offset=0',                              
                        headers: { 'Authorization': 'Token '+token },
                        method: 'GET'
                 }).its('body').then( body => {
                    console.log(body)
                    expect(body.articles[1].title).not.to.equal('Request from API 3')
                 })
            })
    });
})

