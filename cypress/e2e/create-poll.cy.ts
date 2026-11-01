describe('Create poll', () => {
  it('navigates from the home page to the poll form', () => {
    cy.visit('/');
    cy.contains('button', 'CREATE POLL').click();
    cy.location('pathname').should('eq', '/polls');
    cy.get('form').should('be.visible');
  });

  it('requires a name', () => {
    cy.visit('/polls');
    cy.contains('button', 'CREATE').click();
    cy.get('#event:invalid').should('exist');
    cy.location('pathname').should('eq', '/polls');
  });

  it('creates a poll without a description', () => {
    cy.visit('/polls');
    cy.get('#event').should('be.focused').type('No details');
    cy.contains('button', 'CREATE').click();
    cy.location('pathname').should('match', /^\/polls\/.+/);
    cy.contains('h1', 'No details');
    cy.contains('No votes yet');
  });

  it('creates a poll and shows it on the response page', () => {
    cy.createPoll('Camping 2030', 'Lets go outside!');
    cy.contains('h1', 'Camping 2030');
    cy.contains('p', 'Lets go outside!');
    cy.contains('h2', 'Results');
  });

  it('shows the poll link in the share box', () => {
    cy.createPoll('Share me', 'Please');
    cy.location('href').then((href) => {
      cy.get('.share-button .text').should('have.text', href);
    });
  });
});
