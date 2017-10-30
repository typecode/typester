// jshint strict: false

import {
    e2eSetup,
    e2eCleanOutput,
    e2eClickToolbarButton,
    e2eSubmitInputForm,
    e2eFirstTextNode
} from '../helpers/e2eSetup';
import e2eContent from '../helpers/e2eSampleContent';
import selectionHelper from '../helpers/selection';

import toolbarConfig from '../../src/scripts/config/toolbar';

describe('e2e/paragraph', function () {
    let mediator, editableEl, buttonConfigs;
    let { input, output } = e2eContent;

    beforeEach((done) => {
        loadFixtures('index.html');

        const setupComponents = e2eSetup();
        mediator = setupComponents.mediator;
        editableEl = setupComponents.editableEl;

        buttonConfigs = toolbarConfig.buttonConfigs;

        setTimeout(done, 250);
    });

    afterEach(() => {
        mediator.emit('app:destroy');
        mediator = null;
    });

    it('should handle multiple bold toggling', () => {
        let inputContent = input.paragraph;
        let outputContent = output.paragraphBold;
        let selectionString;

        editableEl.innerHTML = inputContent;
        expect(editableEl.innerHTML).toBe(inputContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('bold');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('bold');
        expect(e2eCleanOutput(editableEl)).toBe(inputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('bold');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);
    });

    it('should handle multiple italic toggling', () => {
        let inputContent = input.paragraph;
        let outputContent = output.paragraphItalic;
        let selectionString;

        editableEl.innerHTML = inputContent;
        expect(editableEl.innerHTML).toBe(inputContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('italic');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('italic');
        expect(e2eCleanOutput(editableEl)).toBe(inputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('italic');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);
    });

    it('should handle multiple ordered list toggling', () => {
        let inputContent = input.paragraph;
        let outputContent = output.paragraphOrderedList;
        let selectionString;

        editableEl.innerHTML = inputContent;
        expect(editableEl.innerHTML).toBe(inputContent);

        selectionHelper.selectFirstAndLastTextNodes(editableEl);
        e2eClickToolbarButton('orderedlist');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);

        selectionHelper.selectFirstAndLastTextNodes(editableEl);
        e2eClickToolbarButton('orderedlist');
        expect(e2eCleanOutput(editableEl)).toBe(inputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);

        selectionHelper.selectFirstAndLastTextNodes(editableEl);
        e2eClickToolbarButton('orderedlist');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);
    });

    it('should handle multiple unordered list toggling', () => {
        let inputContent = input.paragraph;
        let outputContent = output.paragraphUnorderedList;
        let selectionString;

        editableEl.innerHTML = inputContent;
        expect(editableEl.innerHTML).toBe(inputContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('unorderedlist');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('unorderedlist');
        expect(e2eCleanOutput(editableEl)).toBe(inputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('unorderedlist');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);
    });

    it('should handle multiple blockquote toggling', () => {
        let inputContent = input.paragraph;
        let outputContent = output.paragraphBlockquote;
        let selectionString;

        editableEl.innerHTML = inputContent;
        expect(editableEl.innerHTML).toBe(inputContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('quote');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('quote');
        expect(e2eCleanOutput(editableEl)).toBe(inputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('quote');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);
    });

    it('should handle link creation and toggling', () => {
        let inputContent = input.paragraph;
        let outputPseudo = output.paragraphPseudo;
        let outputLink1 = output.paragraphLink1;
        let outputLink2 = output.paragraphLink2;
        let selectionString;
        let expectedSelectionString = 'Lorem ipsum dolor sit amet';

        editableEl.innerHTML = inputContent;
        expect(editableEl.innerHTML).toBe(inputContent);
        let textNode = e2eFirstTextNode(editableEl);
        selectionHelper.selectTextPortion(textNode, 0, expectedSelectionString.length);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(expectedSelectionString);

        e2eClickToolbarButton('link');
        selectionString = selectionHelper.getCurrent().toString();
        expect(e2eCleanOutput(editableEl)).toBe(outputPseudo);
        e2eSubmitInputForm('typecode.com');
        expect(e2eCleanOutput(editableEl)).toBe(outputLink1);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(expectedSelectionString);

        let linkNode = editableEl.querySelector('a');
        selectionHelper.selectAll(linkNode);
        e2eClickToolbarButton('link');
        expect(e2eCleanOutput(editableEl)).toBe(inputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(expectedSelectionString);

        editableEl.innerHTML = inputContent;
        expect(editableEl.innerHTML).toBe(inputContent);
        textNode = e2eFirstTextNode(editableEl);
        selectionHelper.selectTextPortion(textNode, 0, expectedSelectionString.length);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(expectedSelectionString);

        e2eClickToolbarButton('link');
        selectionString = selectionHelper.getCurrent().toString();
        expect(e2eCleanOutput(editableEl)).toBe(outputPseudo);
        e2eSubmitInputForm('/videos/');
        expect(e2eCleanOutput(editableEl)).toBe(outputLink2);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(expectedSelectionString);
    });

    it('should handle multiple ordered list toggling on non-first element', () => {
        let inputContent = input.paragraph + input.line;
        let outputContent = output.paragraphLineOrderedList;
        let selectionString;

        editableEl.innerHTML = inputContent;
        expect(editableEl.innerHTML).toBe(inputContent);

        selectionHelper.selectAll(editableEl.lastChild);
        e2eClickToolbarButton('orderedlist');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.lastChild.textContent);

        selectionHelper.selectAll(editableEl.lastChild);
        e2eClickToolbarButton('orderedlist');
        expect(e2eCleanOutput(editableEl)).toBe(inputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.lastChild.textContent);
    });

    it('should handle multiple unordered list toggling on non-first element', () => {
        let inputContent = input.paragraph + input.line;
        let outputContent = output.paragraphLineUnorderedList;
        let selectionString;

        editableEl.innerHTML = inputContent;
        expect(editableEl.innerHTML).toBe(inputContent);

        selectionHelper.selectAll(editableEl.lastChild);
        e2eClickToolbarButton('unorderedlist');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.lastChild.textContent);

        selectionHelper.selectAll(editableEl.lastChild);
        e2eClickToolbarButton('unorderedlist');
        expect(e2eCleanOutput(editableEl)).toBe(inputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.lastChild.textContent);
    });
});
