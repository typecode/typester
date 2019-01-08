// jshint strict: false

import Mediator from '../../../src/scripts/core/Mediator.js';
import Toolbar from '../../../src/scripts/modules/Toolbar.js';
import Selection from '../../../src/scripts/modules/Selection.js';
import Flyout from '../../../src/scripts/modules/Flyout.js';
import Config from '../../../src/scripts/modules/Config.js';

import mockEvents from '../helpers/mockEvents';
import selectionHelper from '../helpers/selection';

describe('modules/Toolbar', function () {
    let mediator, commands;
    let toolbarEl, elStyle, editableEl, flyoutEl;

    beforeEach(() => {
        loadFixtures('index.html');

        editableEl = document.getElementsByClassName('content-editable')[0];

        mediator = new Mediator();
        commands = {
            'format:block' : () => {}
        };
        spyOn(commands, 'format:block').and.callThrough();
        mediator.registerCommandHandlers(commands);

        new Selection({ mediator,
            dom: { el: editableEl },
            props: { contextDocument: document }
        });
        new Config({ mediator });
        new Flyout({ mediator });
        new Toolbar({ mediator, opts: {
            dom: {
                el: document.body
            }
        }});

        flyoutEl = document.getElementsByClassName('typester-flyout');
        toolbarEl = document.getElementsByClassName('typester-toolbar');

        editableEl.innerHTML = '<p>Test text</p>';
        editableEl.contentEditable = true;

        selectionHelper.selectAll(editableEl.childNodes[0]);

        jasmine.clock().install();
    });

    afterEach(() => {
        mediator.emit('app:destroy');
        mediator = null;
        jasmine.clock().uninstall();
    });

    it('should append styles', () => {
        const stylesEl = document.getElementById('typester-styles');
        expect(stylesEl).toBeDefined();
    });

    it('should inject its template', () => {
        expect(flyoutEl.length).toBe(1);
        expect(toolbarEl.length).toBe(1);
        selectionHelper.selectNone();
        mediator.emit('selection:change');
        expect(flyoutEl[0].style.display).toBe('none');
    });

    it('should handle toolbar clicks', () => {
        const menuItems = document.getElementsByClassName('typester-menu-item');
        selectionHelper.selectAll(editableEl.childNodes[0]);

        mockEvents.click(menuItems[2]);
        expect(commands['format:block']).toHaveBeenCalledWith({ style: 'H1', validTags: ['H1'], toggle: false });
        mockEvents.click(menuItems[3]);
        expect(commands['format:block']).toHaveBeenCalledWith({ style: 'H2', validTags: ['H2'], toggle: false });
    });

    it('should show when a range has been selected', () => {
        editableEl.focus();
        selectionHelper.selectAll(editableEl.childNodes[0]);
        mediator.emit('selection:change');
        jasmine.clock().tick(100);
        expect(flyoutEl[0].style.display).toBe('block');
    });

    it('should handle document selectstart', () => {
        // NB expect('test').toBe('written');
    });

    it('should handle document selectionchange', () => {
        // NB expect('test').toBe('written');
    });
});
