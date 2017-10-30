// jshint strict: false

import { e2eSetup, e2eCleanOutput, e2eClickToolbarButton } from '../helpers/e2eSetup';
import e2eContent from '../helpers/e2eSampleContent';
import selectionHelper from '../helpers/selection';

import toolbarConfig from '../../src/scripts/config/toolbar';

describe('e2e/line', function () {
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

    it('should handle multiple H1 toggling', () => {
        let inputContent = input.line;
        let outputContent = output.lineH1;
        let selectionString;

        editableEl.innerHTML = inputContent;
        expect(editableEl.innerHTML).toBe(inputContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('h1');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('h1');
        expect(e2eCleanOutput(editableEl)).toBe(inputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('h1');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);
    });

    it('should handle multiple H2 toggling', () => {
        let inputContent = input.line;
        let outputContent = output.lineH2;
        let selectionString;

        editableEl.innerHTML = inputContent;
        expect(editableEl.innerHTML).toBe(inputContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('h2');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('h2');
        expect(e2eCleanOutput(editableEl)).toBe(inputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);

        selectionHelper.selectAll(editableEl);
        e2eClickToolbarButton('h2');
        expect(e2eCleanOutput(editableEl)).toBe(outputContent);
        selectionString = selectionHelper.getCurrent().toString();
        expect(selectionString).toBe(editableEl.textContent);
    });

});
