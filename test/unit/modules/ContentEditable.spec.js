// jshint strict: false

import Mediator from '../../../src/scripts/core/Mediator';
import ContentEditable from '../../../src/scripts/modules/ContentEditable';
import mockEvents from '../helpers/mockEvents';
import { loadFixtures } from '../helpers/fixtures.js';

describe('modules/ContentEditable', () => {
    let contentEditable, eventHandlers, mediator, $editableEl;

    beforeEach(() => {
        loadFixtures();
        mediator = new Mediator();

        eventHandlers = {
            'contenteditable:focus': function () {},
            'contenteditable:newline': function () {}
        };
        spyOn(eventHandlers, 'contenteditable:focus');
        spyOn(eventHandlers, 'contenteditable:newline');

        mediator.registerEventHandlers(eventHandlers);

        $editableEl = jQuery('.content-editable');

        contentEditable = new ContentEditable({
            mediator,
            dom: { el: $editableEl[0] }
        });
    });

    it('should ensure that its root element is editable', () => {
        expect($editableEl[0].hasAttribute('contenteditable')).toBe(true);
    });

    it('should delegate focus event', () => {
        $editableEl.focus();
        mockEvents.focus($editableEl[0]);
        expect(eventHandlers['contenteditable:focus']).toHaveBeenCalled();
    });

    it('should handle and delegate keyup events', (done) => {
        mockEvents.keyup('ENTER', $editableEl[0]);
        setTimeout(() => {
            expect(eventHandlers['contenteditable:newline']).toHaveBeenCalled();
            done();
        }, 120);
    }, 200);

    it('should handle and delegate paste events', () => {

    });
});
