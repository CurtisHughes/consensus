describe('Home page', () => {
  it('shows the app name and a create poll button', () => {
    cy.visit('/');
    cy.contains('h1', 'Consensus');
    cy.contains('p', 'create, vote, share. no logins required');
    cy.contains('button', 'CREATE POLL').should('be.visible');
  });

  it('links to the privacy page from the footer', () => {
    cy.visit('/');
    cy.contains('footer a', 'Privacy').click();
    cy.location('pathname').should('eq', '/privacy');
    cy.contains('h1', 'Privacy');
    cy.contains('a', 'Back to home').click();
    cy.location('pathname').should('eq', '/');
  });
});

describe('Unknown pages', () => {
  it('shows a not found page that links back home', () => {
    cy.visit('/does/not/exist');
    cy.contains('h1', 'Page not found');
    cy.contains('a', 'Back to home').click();
    cy.location('pathname').should('eq', '/');
  });
});
