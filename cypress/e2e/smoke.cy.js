describe('Login smoke', () => {
  it('logs in as standard_user', () => {
    cy.visit('/');

    cy.get('[data-test="username"]').type('standard_user');
    cy.get('[data-test="password"]').type('secret_sauce');
    cy.get('[data-test="login-button"]').click();

    cy.url().should('include', '/inventory.html');
    cy.get('.title').should('have.text', 'Products');
  });
});