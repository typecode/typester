// jshint strict: false

import Mediator from '../../../src/scripts/core/Mediator';
import Selection from '../../../src/scripts/modules/Selection';
import selectionHelper from '../helpers/selection';

describe('modules/Selection', () => {
    let $editableEl, editableEl, editableElHTML;
    let mediator;

    beforeEach(() => {
        loadFixtures('index.html');

        $editableEl = jQuery('.content-editable');
        editableEl = $editableEl[0];
        editableElHTML = 'test selection';

        $editableEl.html(editableElHTML);
        $editableEl.attr('contenteditable', true);
        $editableEl.focus();

        mediator = new Mediator();
        new Selection({ mediator,
            dom: {
                el: editableEl
            }
        });
    });

    it('should return the current selection', () => {
        selectionHelper.selectAll(editableEl);
        const currentSelection = mediator.get('selection:current').toString();
        expect(currentSelection).toBe(editableElHTML);
    });

    it('should return the anchorNode of the current selection', () => {
        selectionHelper.selectTextPortion(editableEl.childNodes[0], 3, editableEl.childNodes[0].length - 3);
        const anchorNode = mediator.get('selection:anchornode');
        expect(anchorNode).toBe(editableEl.childNodes[0]);
    });

    it('should return the common ancestor of the current selection range', () => {
        let commonAncestor;

        const pTag = document.createElement('p');
        const firstTextNode = document.createTextNode('first text node ');
        const lastTextNode = document.createTextNode('last text node');

        pTag.appendChild(firstTextNode);
        pTag.appendChild(lastTextNode);

        editableEl.contentEditable = false;
        editableEl.appendChild(pTag);
        editableEl.contentEditable = true;
        editableEl.focus();

        selectionHelper.selectFromTo(pTag.childNodes[0], 3, pTag.childNodes[1], pTag.childNodes[1].length - 3);
        commonAncestor = mediator.get('selection:commonancestor');
        expect(commonAncestor).toBe(pTag);

        selectionHelper.selectFromTo(pTag.childNodes[0], 3, pTag.childNodes[0], pTag.childNodes[0].length - 3);
        commonAncestor = mediator.get('selection:commonancestor');
        expect(commonAncestor).toBe(pTag.childNodes[0]);
    });

    it('should return the closest block level elements', () => {
        const divTag = document.createElement('div');
        const pTag = document.createElement('p');
        const spanTag = document.createElement('span');
        const firstTextNode = document.createTextNode('first text node');
        const lastTextNode = document.createTextNode('last text node');

        spanTag.appendChild(firstTextNode);
        spanTag.appendChild(lastTextNode);
        pTag.appendChild(spanTag);
        divTag.appendChild(pTag);

        editableEl.contentEditable = false;
        editableEl.appendChild(pTag);
        editableEl.contentEditable = true;
        editableEl.focus();

        selectionHelper.selectFromTo(firstTextNode, 3, lastTextNode, 10);
        const closestBlockEl = mediator.get('selection:closestblock');
        expect(closestBlockEl).toBe(pTag);
    });

    it('should return the root element of the selection', () => {
        const firstDiv = document.createElement('div');
        const secondDiv = document.createElement('div');
        const thirdDiv = document.createElement('div');

        thirdDiv.innerHTML = 'some text';
        secondDiv.appendChild(thirdDiv);
        firstDiv.appendChild(secondDiv);

        editableEl.contentEditable = false;
        editableEl.innerHTML = '';
        editableEl.appendChild(firstDiv);
        editableEl.contentEditable = true;
        editableEl.focus();

        selectionHelper.selectAll(thirdDiv);

        const commonancestor = mediator.get('selection:commonancestor');
        expect(commonancestor === thirdDiv || commonancestor === thirdDiv.childNodes[0]).toBe(true);

        const selectionRootEl = mediator.get('selection:rootelement');
        expect(selectionRootEl).toBe(editableEl);
    });

    it('should return a clone of the selection range', function () {
        const currentRange = mediator.get('selection:range');
        const clonedRange = mediator.get('selection:range:clone');
        expect(currentRange).not.toBe(clonedRange);
        expect(currentRange.startContainer).toBe(clonedRange.startContainer);
        expect(currentRange.endContainer).toBe(clonedRange.endContainer);
        expect(currentRange.startOffset).toBe(clonedRange.startOffset);
        expect(currentRange.endOffset).toBe(clonedRange.endOffset);
    });
});
