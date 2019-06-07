// jshint strict: false

import Mediator from '../../../src/scripts/core/Mediator';
import Selection from '../../../src/scripts/modules/Selection';
import Config from '../../../src/scripts/modules/Config';
import selectionHelper from '../helpers/selection';
import { loadFixtures } from '../helpers/fixtures.js';

describe('modules/Selection', () => {
    let $editableEl, editableEl, editableElHTML;
    let mediator;

    beforeEach(() => {
        loadFixtures();

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
        new Config({ mediator });
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

        const selectionRootEl = mediator.get('selection:rootelement');
        expect(selectionRootEl).toBe(editableEl);
    });
});
