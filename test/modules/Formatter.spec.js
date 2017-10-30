// jshint strict: false

import Formatter from '../../src/scripts/modules/Formatter';
import Mediator from '../../src/scripts/core/Mediator';
import selectionHelper from '../helpers/selection';

xdescribe('modules/Formatter', function () {
    let $editableEl, headerText;
    let mediator;

    headerText = 'header text';

    beforeEach(() => {
        loadFixtures('index.html');

        $editableEl = jQuery('.content-editable');
        $editableEl.attr('contenteditable', true);
        $editableEl.focus();

        mediator = new Mediator();
        new Formatter({
            mediator,
            props: {
                contextWindow: window
            }
        });
    });

    it('should handle keyup:enter (newline) event', () => {
        mediator.emit('contenteditable:keyup:enter');

        const lastElem = $editableEl[0].lastElementChild;
        expect(lastElem.tagName).toBe('P');
    });

    it('should be able to format headers', () => {
        $editableEl.html(headerText);

        ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].forEach((headerStyle) => {
            const headerTag = headerStyle.toLowerCase();
            selectionHelper.selectAll($editableEl[0]);
            mediator.exec('format:block', { style: headerStyle });
            expect($editableEl.html()).toBe(`<${headerTag}>${headerText}</${headerTag}>`);
        });
    });

    it('should clear previous block formatting before performing new block format', () => {
        $editableEl.html(`<div>${headerText}</div>`);

        selectionHelper.selectAll($editableEl[0]);
        mediator.exec('format:default');
        expect($editableEl.html()).toBe(`<p>${headerText}</p>`);

        selectionHelper.selectAll($editableEl[0]);
        mediator.exec('format:block', { style: 'H1' });
        expect($editableEl.html()).toBe(`<h1>${headerText}</h1>`);
    });
});
