// jshint strict: false

import Mediator from '../../../src/scripts/core/Mediator';
import Canvas from '../../../src/scripts/modules/Canvas';

import selectionHelper from '../helpers/selection';

describe('modules/Canvas', function () {
    let canvas, mediator, iframe;
    let $editableEl, editableEl, editableElInnerHTML;

    editableElInnerHTML = '<h1>Test title</h1><p>Test paragraph, <b>with bold text</b></p>';

    beforeEach((done) => {
        loadFixtures('index.html');

        $editableEl = jQuery('.content-editable');
        editableEl = $editableEl[0];

        editableEl.contentEditable = true;
        editableEl.innerHTML = editableElInnerHTML;

        mediator = new Mediator();
        canvas = new Canvas({ mediator });
        iframe = document.getElementsByClassName('typester-canvas');

        setTimeout(done, 250);
    });

    it('should append an iframe to the document body', () => {
        // expect(iframe.length).toBe(1);
        expect(iframe.length).toBeGreaterThan(0);
    });

    it('should get the canvas document', () => {
        const canvasDoc = mediator.get('canvas:document');
        expect(canvasDoc.body).toBeDefined();
    });

    it('should get the canvas window', () => {
        const canvasWin = mediator.get('canvas:window');
        expect(canvasWin.document).toBeDefined();
    });

    it('should get the canvas body', () => {
        const canvasBody = mediator.get('canvas:body');
        expect(canvasBody.tagName).toBe('BODY');
    });

    it('should set the canvas body to be editable', () => {
        const canvasBody = mediator.get('canvas:body');
        expect(canvasBody.hasAttribute('contenteditable')).toBe(true);
    });

    it('should set the canvas content', () => {
        const testContentHTML = '<p>test content</p>';
        const canvasDoc = mediator.get('canvas:document');
        mediator.exec('canvas:content', testContentHTML);
        expect(canvasDoc.body.innerHTML).toBe(testContentHTML);
    });
});
