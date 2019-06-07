/*global cy*/
describe('Paragraph specs', function () {
    beforeEach(function () {
        cy.contentEditable().setSampleContent('paragraph');
        cy.toolbar().should('not.be.visible');
        cy.contentEditable().selectAll();
    });

    it('should toggle bold', function () {
        cy.toolbarClick('bold');
        cy.contentEditable().assertContent('paragraphBold');
        cy.toolbarClick('bold');
        cy.contentEditable().assertContent('paragraph', true);
        cy.toolbarClick('bold');
        cy.contentEditable().assertContent('paragraphBold');
    });

    it('should toggle italic', function () {
        cy.toolbarClick('italic');
        cy.contentEditable().assertContent('paragraphItalic');
        cy.toolbarClick('italic');
        cy.contentEditable().assertContent('paragraph', true);
        cy.toolbarClick('italic');
        cy.contentEditable().assertContent('paragraphItalic');
    });

    it('should toggle H1', function () {
        cy.contentEditable().selectElement('p:first-child').type('{leftarrow}{enter}');
        cy.contentEditable().selectElement('p:first-child').type('{leftarrow}');
        cy.contentEditable().typeSampleContent('line');
        cy.contentEditable().assertContent('lineParagraph');

        cy.contentEditable().selectElement('p:first-child');
        cy.toolbarClick('h1');
        cy.contentEditable().assertContent('h1Paragraph');
        cy.toolbarClick('h1');
        cy.contentEditable().assertContent('lineParagraph');
        cy.toolbarClick('h1');
        cy.contentEditable().assertContent('h1Paragraph');
        cy.toolbarClick('h2');
        cy.contentEditable().assertContent('h2Paragraph');
    });

    it('should toggle H2', function () {
        cy.contentEditable().selectElement('p:first-child').type('{leftarrow}{enter}');
        cy.contentEditable().selectElement('p:first-child').type('{leftarrow}');
        cy.contentEditable().typeSampleContent('line');
        cy.contentEditable().assertContent('lineParagraph');

        cy.contentEditable().selectElement('p:first-child');
        cy.toolbarClick('h2');
        cy.contentEditable().assertContent('h2Paragraph');
        cy.toolbarClick('h2');
        cy.contentEditable().assertContent('lineParagraph');
        cy.toolbarClick('h2');
        cy.contentEditable().assertContent('h2Paragraph');
        cy.toolbarClick('h1');
        cy.contentEditable().assertContent('h1Paragraph');
    });

    it('should toggle blockquote', function () {
        cy.toolbarClick('quote');
        cy.contentEditable().assertContent('paragraphBlockquote');
        cy.toolbarClick('quote');
        cy.contentEditable().assertContent('paragraph', true);
        cy.toolbarClick('quote');
        cy.contentEditable().assertContent('paragraphBlockquote');
    });

    it('should create a link', function () {
        cy.contentEditable().selectElement('p:first-child').type('{leftarrow}{enter}');
        cy.contentEditable().selectElement('p:first-child').type('{leftarrow}');
        cy.contentEditable().typeSampleContent('line');
        cy.contentEditable().assertContent('lineParagraph');

        cy.contentEditable().get('p:first-child').setSelection('ipsum dolor sit amet');
        cy.toolbarClick('link');
        cy.wait(100);
        cy.get('.typester-input-form .user-input').click().type('http://link.test{enter}');
        cy.contentEditable().assertContent('lineLinkParagraph');
        cy.toolbarClick('link');
        cy.contentEditable().assertContent('lineParagraph');
    });

    it('should toggle bold/italic', function () {
        cy.contentEditable().setSelection('iaculis mi scelerisque');
        cy.toolbarClick('bold');
        cy.contentEditable().assertContent('paragraphBoldSubstring');
        cy.toolbarClick('bold');
        cy.contentEditable().assertContent('paragraph', true);
        cy.toolbarClick('italic');
        cy.contentEditable().assertContent('paragraphItalicSubstring');
        cy.toolbarClick('italic');
        cy.contentEditable().assertContent('paragraph', true);
    });
});