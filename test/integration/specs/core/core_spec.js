/*global cy*/
describe('Core specs', function () {
    it('should have setup correctly', function () {
        cy.get('.typester-content-editable').should('be.visible').then(($el) => {
            expect($el).to.have.attr('contenteditable', 'true');
        });
        cy.get('.typester-toolbar').should('exist');
        cy.get('.typester-canvas').should('exist');
    });

    it('should destroy correctly', function () {
        cy.window().then(win => {
            win.typesterInstance.destroy();
            cy.get('.typester-toolbar').should('not.exist');
            cy.get('.typester-canvas').should('not.exist');
        });
    });
});