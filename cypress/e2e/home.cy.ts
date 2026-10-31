describe('Home page', () => {
  it('shows the app name and a create poll button', () => {
    cy.visit('/');
    cy.contains('h1', 'Consensus');
    cy.contains('p', 'create, vote, share. no logins required');
    cy.contains('button', 'CREATE POLL').should('be.visible');
  });
});
