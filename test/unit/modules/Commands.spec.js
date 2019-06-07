// jshint strict: false

import Mediator from '../../../src/scripts/core/Mediator';
import Commands from '../../../src/scripts/modules/Commands';
import Config from '../../../src/scripts/modules/Config';
import selectionHelper from '../helpers/selection';
import DOM from '../../../src/scripts/utils/DOM';
import { loadFixtures } from '../helpers/fixtures.js';

describe('modules/Commands', function () {
    let mediator, $editableEl, editableEl;

    beforeEach((done) => {
        loadFixtures();

        mediator = new Mediator();
        new Commands({ mediator });
        new Config({ mediator });

        $editableEl = jQuery('.content-editable');
        editableEl = $editableEl[0];
        editableEl.contentEditable = true;

        setTimeout(done, 250);
    });

    it('should execute a given command', () => {
        const contentBlock = document.createElement('p');
        const contentBlockText = 'text inside an exisiting block';

        contentBlock.innerHTML = contentBlockText;
        editableEl.innerHTML = '';
        editableEl.appendChild(contentBlock);

        selectionHelper.selectAll(contentBlock.childNodes[0]);
        mediator.exec('commands:exec', {
            command: 'formatBlock',
            value: 'H1'
        });

        expect(editableEl.innerHTML).toBe(`<h1>${contentBlockText}</h1>`);
    });

    it('should execute a default command', () => {
        const contentBlock = document.createElement('h1');
        const contentBlockText = 'text inside an exisiting block';

        contentBlock.innerHTML = contentBlockText;
        editableEl.innerHTML = '';
        editableEl.appendChild(contentBlock);

        selectionHelper.selectAll(contentBlock.childNodes[0]);
        mediator.exec('commands:format:default');

        expect(editableEl.innerHTML).toBe(`<p>${contentBlockText}</p>`);
    });

    it('should execute a formatBlock command', () => {
        const contentBlock = document.createElement('p');
        const contentBlockText = 'text inside an exisiting block';

        contentBlock.innerHTML = contentBlockText;
        editableEl.innerHTML = '';
        editableEl.appendChild(contentBlock);

        selectionHelper.selectAll(contentBlock.childNodes[0]);
        mediator.exec('commands:format:block', {
            style: 'BLOCKQUOTE'
        });


        const blockquoteParagraphs = editableEl.querySelectorAll('blockquote p');
        blockquoteParagraphs.forEach((paragraph) => {
            DOM.unwrap(paragraph);
        });

        expect(editableEl.innerHTML).toBe(`<blockquote>${contentBlockText}</blockquote>`);
    });
});
