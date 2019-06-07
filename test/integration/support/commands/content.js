/*global cy Cypress*/
Cypress.Commands.add('setContent', { prevSubject: true }, (subject, content) => {
    return cy.wrap(subject).then($el => {
        $el.html(content);
    });
});

Cypress.Commands.add('setSampleContent', { prevSubject: true }, (subject, contentKey) => {
    cy.fixture('sampleContent').then(sampleContent => {
        cy.wrap(subject).setContent(sampleContent.input[contentKey]);
    });

    return cy.wrap(subject);
});

Cypress.Commands.add('assertContent', { prevSubject: true }, (subject, contentKey, useInput = false) => {
    cy.fixture('sampleContent').then(sampleContent => {
        const testContent = useInput ? sampleContent.input[contentKey] : sampleContent.output[contentKey];
        cy.wrap(subject).should('have.html', testContent);
    });
});

Cypress.Commands.add('typeSampleContent', { prevSubject: true }, (subject, contentKey) => {
    cy.fixture('sampleContent').then(sampleContent => {
        cy.wrap(subject).type(sampleContent.input[contentKey].match(/<p>(.*?)<\/p>/)[1]);
    });
    return cy.wrap(subject);
});