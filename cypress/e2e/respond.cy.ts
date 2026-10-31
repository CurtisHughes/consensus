const DAY = /^15$/;

function dayCell() {
  return cy.contains('.day p', DAY).closest('.day-container');
}

describe('Responding to a poll', () => {
  beforeEach(() => {
    cy.createPoll('Game night', 'Pick your dates');
  });

  it('adds and removes a vote when a day is clicked', () => {
    cy.contains('.day p', DAY).click();
    dayCell().should('have.class', 'checked');
    cy.get('.suggestions li').should('have.length', 1).and('contain.text', '1 / 1');

    cy.contains('.day p', DAY).click();
    dayCell().should('not.have.class', 'checked');
    cy.get('.suggestions li').should('have.length', 0);
  });

  it('keeps votes after a reload', () => {
    cy.contains('.day p', DAY).click();
    cy.get('.suggestions li').should('have.length', 1);

    cy.reload();
    dayCell().should('have.class', 'checked');
    cy.get('.suggestions li').should('contain.text', '1 / 1');
  });

  it('lists multiple chosen days as suggestions', () => {
    cy.contains('.day p', /^10$/).click();
    cy.get('.suggestions li').should('have.length', 1);
    cy.contains('.day p', /^20$/).click();
    cy.get('.suggestions li').should('have.length', 2);
  });

  it('navigates between months', () => {
    const heading = () => cy.get('.date-picker header h1');
    heading()
      .invoke('text')
      .then((initial) => {
        cy.get('button[aria-label="Next month"]').click();
        heading().invoke('text').should('not.eq', initial);
        cy.get('button[aria-label="Previous month"]').click();
        heading().should('have.text', initial);
      });
  });

  it("counts another participant's vote", () => {
    cy.contains('.day p', DAY).click();
    cy.get('.suggestions li').should('contain.text', '1 / 1');

    const now = new Date();
    cy.location('pathname').then((pathname) => {
      const pollId = pathname.split('/').pop();
      cy.request({
        method: 'POST',
        url: `http://localhost:8080/v1/projects/demo-consensus/databases/(default)/documents/polls/${pollId}/responses`,
        headers: { Authorization: 'Bearer owner' },
        body: {
          fields: {
            author: { stringValue: 'someone-else' },
            value: {
              mapValue: {
                fields: {
                  year: { integerValue: String(now.getFullYear()) },
                  month: { integerValue: String(now.getMonth()) },
                  day: { integerValue: '15' },
                },
              },
            },
          },
        },
      });
    });

    cy.get('.suggestions li').should('contain.text', '2 / 2');
  });
});
