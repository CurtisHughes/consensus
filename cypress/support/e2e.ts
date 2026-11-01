const PROJECT = 'demo-consensus';
const AUTH_URL = `http://localhost:9099/emulator/v1/projects/${PROJECT}/accounts`;
const FIRESTORE_URL = `http://localhost:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Clears all users and documents from the Firebase emulators. */
      resetEmulators(): Chainable<void>;
      /** Creates a poll through the UI and waits for the response page. */
      createPoll(name: string, description: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('resetEmulators', () => {
  cy.request('DELETE', AUTH_URL);
  cy.request('DELETE', FIRESTORE_URL);
});

Cypress.Commands.add('createPoll', (name: string, description: string) => {
  cy.visit('/polls');
  cy.get('#event').type(name);
  cy.get('#description').type(description);
  cy.contains('button', 'CREATE').click();
  cy.location('pathname').should('match', /^\/polls\/[^/]+$/);
});

beforeEach(() => {
  cy.resetEmulators();
});

export {};
