/// <reference types="cypress" />

describe('Test with backend', ()=> {
    
    beforeEach('login to the app', () => {
        cy.loginToApplication()
    })

    it.only('verify correct request and response', ()=> {

        cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('Article One7')
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
})

