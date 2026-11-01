const DAY = /^15$/;

function dayButton(day: RegExp = DAY) {
  return cy.contains('.day-number', day).closest('button.day');
}

function dayCell() {
  return dayButton().closest('.day-container');
}

describe('Responding to a poll', () => {
  beforeEach(() => {
    cy.createPoll('Game night', 'Pick your dates');
    // Past days are disabled, so vote on next month to keep the specs date-independent.
    cy.get('button[aria-label="Next month"]').click();
  });

  it('adds and removes a vote when a day is clicked', () => {
    dayButton().click();
    dayCell().should('have.class', 'checked');
    cy.get('.suggestions li').should('have.length', 1).and('contain.text', '1 / 1');

    dayButton().click();
    dayCell().should('not.have.class', 'checked');
    cy.get('.suggestions li').should('have.length', 0);
  });

  it('exposes days as labelled toggle buttons', () => {
    dayButton().should('have.attr', 'aria-pressed', 'false').and('have.attr', 'type', 'button');
    dayButton()
      .invoke('attr', 'aria-label')
      .should('match', /15, \d{4}, 0 votes$/);

    dayButton().focus().click();
    dayButton()
      .should('have.attr', 'aria-pressed', 'true')
      .invoke('attr', 'aria-label')
      .should('match', /1 vote$/);
  });

  it('disables days in the past', () => {
    cy.get('button[aria-label="Previous month"]').click();
    cy.get('button[aria-label="Previous month"]').click();
    cy.get('button.day').should('have.length.greaterThan', 27);
    cy.get('button.day:enabled').should('not.exist');
  });

  it('keeps votes after a reload', () => {
    dayButton().click();
    cy.get('.suggestions li').should('have.length', 1);

    cy.reload();
    cy.get('button[aria-label="Next month"]').click();
    dayCell().should('have.class', 'checked');
    cy.get('.suggestions li').should('contain.text', '1 / 1');
  });

  it('lists multiple chosen days as suggestions', () => {
    dayButton(/^10$/).click();
    cy.get('.suggestions li').should('have.length', 1);
    dayButton(/^20$/).click();
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
    dayButton().click();
    cy.get('.suggestions li').should('contain.text', '1 / 1');

    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
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
                  year: { integerValue: String(nextMonth.getFullYear()) },
                  month: { integerValue: String(nextMonth.getMonth()) },
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

describe('Poll page errors', () => {
  it('shows a message for a poll that does not exist', () => {
    cy.visit('/polls/does-not-exist');
    cy.get('[role="alert"]').should('contain.text', "couldn't find that poll");
    cy.get('.date-picker').should('not.exist');
  });
});
