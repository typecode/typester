/*global cy Cypress*/
const CLASSNAMES = {
    contentEditable: 'typester-content-editable',
    toolbar: 'typester-toolbar',
    menuItem: 'typester-menu-item'
};

Cypress.Commands.add('contentEditable', function () {
    return cy.get(`.${CLASSNAMES.contentEditable}`);
});

Cypress.Commands.add('toolbar', function () {
    return cy.get(`.${CLASSNAMES.toolbar}`);
});

Cypress.Commands.add('toolbarClick', function (configKey) {
    return cy.get(`.${CLASSNAMES.menuItem}[data-config-key="${configKey}"]`).click({ force: true });
});