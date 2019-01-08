// jshint strict: false

import BlockFormatter from '../../../src/scripts/modules/BlockFormatter';
import toolbarConfig from '../../../src/scripts/config/toolbar';

import formatterSetup from '../helpers/formatterSetup';
import userInputHelper from '../helpers/userInput';
import selectionHelper from '../helpers/selection';

describe('modules/BlockFormatter', function () {
    let mediator;
    let editableEl;
    let headerText, buttonConfigs;

    headerText = 'header text';

    beforeEach((done) => {
        loadFixtures('index.html');

        const setupComponents = formatterSetup(BlockFormatter);
        editableEl = setupComponents.editableEl;
        mediator = setupComponents.mediator;

        buttonConfigs = toolbarConfig.buttonConfigs;
        userInputHelper.focus(editableEl);

        setTimeout(done, 250)
    });

    afterEach(() => {
        editableEl.innerHTML = '';
        mediator.emit('app:destroy');
    });

    xit('should default the block if contenteditable triggers newline', () => {
        const defaultFormatRegex = /<p>(<br\/?>)?<\/p>/;
        selectionHelper.selectAll(editableEl);
        mediator.emit('contenteditable:newline');

        expect(defaultFormatRegex.test(editableEl.innerHTML)).toBe(true);
    });

    it('should not try default if newline is already in a block', () => {
        const contentBlock = document.createElement('h1');
        const contentBlockText = 'text inside an existing block';

        contentBlock.innerHTML = contentBlockText;
        editableEl.innerHTML = '';
        editableEl.appendChild(contentBlock);

        selectionHelper.selectAll(contentBlock.childNodes[0]);
        mediator.emit('contenteditable:newline');

        expect(editableEl.innerHTML).toBe(`<h1>${contentBlockText}</h1>`);
    });

    it('should be able to format headers', () => {
        editableEl.innerHTML = headerText;

        ['H1', 'H2'/*, 'H3', 'H4', 'H5', 'H6'*/].forEach((headerStyle) => {
            const headerTag = headerStyle.toLowerCase();
            selectionHelper.selectAll(editableEl.childNodes[0]);
            mediator.exec('format:block', buttonConfigs[headerTag].opts);
            expect(editableEl.innerHTML).toBe(`<${headerTag}>${headerText}</${headerTag}>`);
        });
    });

    it('should clear previous block formatting before performing new block format', () => {
        const blockOuter = document.createElement('div');
        const blockInner = document.createElement('div');

        blockInner.innerHTML = headerText;
        blockOuter.appendChild(blockInner);
        editableEl.innerHTML = '';
        editableEl.appendChild(blockOuter);

        selectionHelper.selectAll(blockInner);
        mediator.exec('format:block', { style: 'P', validTags: ['P'] });
        expect(editableEl.innerHTML).toBe(`<p>${headerText}</p>`);

        selectionHelper.selectAll(editableEl.childNodes[0]);
        mediator.exec('format:block', buttonConfigs.h1.opts);
        expect(editableEl.innerHTML).toBe(`<h1>${headerText}</h1>`);
    });
});
