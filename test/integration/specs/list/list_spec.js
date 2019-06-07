/*global cy*/
describe('List specs', function () {
    beforeEach(function () {
        cy.contentEditable().setSampleContent('paragraph');
        cy.toolbar().should('not.be.visible');
        cy.contentEditable().selectAll();
    });

    it('should create/toggle OL', function () {
        cy.toolbarClick('orderedlist');
        cy.contentEditable().assertContent('orderedList');
        cy.toolbarClick('orderedlist');
        cy.contentEditable().assertContent('paragraph', true);
        cy.toolbarClick('orderedlist');
        cy.contentEditable().assertContent('orderedList');

        cy.contentEditable().type('{rightarrow}{enter}');
        cy.contentEditable().typeSampleContent('line');
        cy.contentEditable().assertContent('orderedListParagraphLine');
    });

    it('should create/toggle UL', function () {
        cy.toolbarClick('unorderedlist');
        cy.contentEditable().assertContent('unorderedList');
        cy.toolbarClick('unorderedlist');
        cy.contentEditable().assertContent('paragraph', true);
        cy.toolbarClick('unorderedlist');
        cy.contentEditable().assertContent('unorderedList');

        cy.contentEditable().type('{rightarrow}{enter}');
        cy.contentEditable().typeSampleContent('line');
        cy.contentEditable().assertContent('unorderedListParagraphLine');
    });

    it('should create/toggle OL on new line', function () {
        cy.contentEditable().type('{rightarrow}{enter}');
        cy.contentEditable().typeSampleContent('line');
        cy.contentEditable().selectElement('p:last-child');

        cy.toolbarClick('orderedlist');
        cy.contentEditable().assertContent('paragraphOrderedList');
        cy.toolbarClick('orderedlist');
        cy.contentEditable().assertContent('paragraphLine');
    });

    it('should create/toggle UL on new line', function () {
        cy.contentEditable().type('{rightarrow}{enter}');
        cy.contentEditable().typeSampleContent('line');
        cy.contentEditable().selectElement('p:last-child');

        cy.toolbarClick('unorderedlist');
        cy.contentEditable().assertContent('paragraphUnorderedList');
        cy.toolbarClick('unorderedlist');
        cy.contentEditable().assertContent('paragraphLine');
    });

    it('should toggle off a single ordered list item', function () {
        cy.contentEditable().setSampleContent('orderedlist');
        cy.toolbar().should('not.be.visible');
        cy.contentEditable().selectAll();

        cy.contentEditable().type('{rightarrow}{enter}');
        cy.contentEditable().typeSampleContent('line');
        cy.contentEditable().assertContent('orderedListThreeItems');

        cy.contentEditable().selectElement('li:last-child');
        cy.toolbarClick('orderedlist');
        cy.contentEditable().assertContent('orderedListTwoItemsLine');
        cy.toolbarClick('h1');
        cy.contentEditable().assertContent('orderedListTwoItemsH1');
        cy.toolbarClick('orderedlist');
        cy.contentEditable().assertContent('orderedListThreeItems');
        cy.toolbarClick('orderedlist');
        cy.contentEditable().assertContent('orderedListTwoItemsLine');
        cy.toolbarClick('h2');
        cy.contentEditable().assertContent('orderedListTwoItemsH2');
    });

    it('should toggle off a single unordered list item', function () {
        cy.contentEditable().setSampleContent('unorderedlist');
        cy.toolbar().should('not.be.visible');
        cy.contentEditable().selectAll();

        cy.contentEditable().type('{rightarrow}{enter}');
        cy.contentEditable().typeSampleContent('line');
        cy.contentEditable().assertContent('unorderedListThreeItems');

        cy.contentEditable().selectElement('li:last-child');
        cy.toolbarClick('unorderedlist');
        cy.contentEditable().assertContent('unorderedListTwoItemsLine');
        cy.toolbarClick('h1');
        cy.contentEditable().assertContent('unorderedListTwoItemsH1');
        cy.toolbarClick('unorderedlist');
        cy.contentEditable().assertContent('unorderedListThreeItems');
        cy.toolbarClick('unorderedlist');
        cy.contentEditable().assertContent('unorderedListTwoItemsLine');
        cy.toolbarClick('h2');
        cy.contentEditable().assertContent('unorderedListTwoItemsH2');
    });
});