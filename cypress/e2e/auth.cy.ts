describe('Authentication', () => {
  it('signs in anonymously and returns to the requested page', () => {
    cy.visit('/polls');
    cy.location('pathname').should('eq', '/polls');
    cy.contains('label', 'Event Name:').should('be.visible');
  });

  it('preserves the full next url including the query string', () => {
    cy.visit('/login?nextUrl=%2Fpolls%3Fref%3Dtest');
    cy.location('pathname').should('eq', '/polls');
    cy.location('search').should('eq', '?ref=test');
  });

  it('falls back to home for protocol-relative redirects', () => {
    cy.visit('/login?nextUrl=//evil.example.com');
    cy.location('pathname').should('eq', '/');
    cy.location('hostname').should('eq', 'localhost');
    cy.contains('h1', 'Consensus');
  });

  it('falls back to home for absolute external redirects', () => {
    cy.visit('/login?nextUrl=https://evil.example.com');
    cy.location('pathname').should('eq', '/');
    cy.location('hostname').should('eq', 'localhost');
  });
});
