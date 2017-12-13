// jshint strict: false

import Mediator from '../../../src/scripts/core/Mediator';
import BaseFormatter from '../../../src/scripts/modules/BaseFormatter';
import zeroWidthSpace from '../../../src/scripts/utils/zeroWidthSpace';

import formatterSetup from '../helpers/formatterSetup';
import userInputHelper from '../helpers/userInput';
import selectionHelper from '../helpers/selection';

describe('modules/BaseFormatter', function () {
    let mediator, editableEl;

    beforeEach((done) => {
        loadFixtures('index.html');

        const setupComponents = formatterSetup(BaseFormatter, {
            skipBaseFormatter: true
        });
        mediator = setupComponents.mediator;
        editableEl = setupComponents.editableEl;

        userInputHelper.focus(editableEl);

        setTimeout(done, 250);
    });

    afterEach(() => {

    });

    it('should copy editable content to the canvas', () => {
        editableEl.innerHTML = '<p>Basic test</p>';
        const canvasBody = mediator.get('canvas:body');
        selectionHelper.selectAll(editableEl);
        mediator.exec('format:export:to:canvas');
        expect(zeroWidthSpace.assert(editableEl.firstChild)).toBe(true);
        expect(zeroWidthSpace.assert(editableEl.lastChild)).toBe(true);
        editableEl.removeChild(editableEl.firstChild);
        editableEl.removeChild(editableEl.lastChild);
        expect(canvasBody.innerHTML).toBe(editableEl.innerHTML);
    });

    it('should import content from the canvas to the editable element', () => {
        const canvasDoc = mediator.get('canvas:document');
        const canvasBody = mediator.get('canvas:body');
        canvasBody.innerHTML = '<p>Basic test</p>';
        canvasBody.contentEditable = true;
        selectionHelper.selectAll(canvasBody.firstChild);
        mediator.exec('format:import:from:canvas');
        expect(editableEl.innerHTML).toBe(canvasBody.innerHTML);
    });

    it('should clean html on export', () => {
        const canvasBody = mediator.get('canvas:body');
        canvasBody.innerHTML = `
            <h1><span>Heading copy</span></h1>
            <div><h2>Sub heading copy</h2></div>
            <article>
                <p>First paragraph</p>
                <span style='font-size: 16px;'>After first paragraph</span>
                <p><font>Second paragraph</font></p>
            </article>
            <ul><li><font>List item 1</font></li></ul>
        `;
        selectionHelper.selectFromTo(canvasBody.firstChild, 0, canvasBody.firstChild, 1);
        mediator.exec('format:import:from:canvas');
        if (!/\w+/.test(canvasBody.firstChild.textContent) && !/\w+/.test(editableEl.firstChild.textContent)) {
            canvasBody.removeChild(canvasBody.firstChild);
            editableEl.removeChild(editableEl.firstChild);
        }
        expect(editableEl.innerHTML).toBe('<h1>Heading copy</h1><h2>Sub heading copy</h2><p>First paragraph</p><p>After first paragraph</p><p>Second paragraph</p><ul><li>List item 1</li></ul>');
    });
});
