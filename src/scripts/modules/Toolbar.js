// jshint strict: false

/**
 * Toolbar -
 * Handle the display of the toolbar and its controls and wire interactions to the
 * correct formatter using the toolbar config.
 * @access protected
 * @module modules/Toolbar
 *
 * @example
 * // Available commands
 * commands: {
 *   'toolbar:hide' : 'hideToolbar',
 *   'toolbar:set:buttons' : 'setButtons'
 * }
 */
import Module from '../core/Module';
import DOM from '../utils/DOM';

import toolbarTemplate from '../../templates/toolbar.html';
import toolbarStyles from '../../styles/toolbar.scss';

const Toolbar = Module({
    name: 'Toolbar',
    dom: {
        'toolbarMenuItems': '.typester-menu-item'
    },
    props: {
        el: null,
        styles: null,
        mouseover: 0,
        classNames: {
            MENU_ITEM: 'typester-menu-item',
            ACTIVE: 's--active'
        }
    },
    handlers: {
        commands: {
            'toolbar:hide' : 'hideToolbar',
            'toolbar:set:buttons' : 'setButtons'
        },
        events: {
            // 'contenteditable:focus': 'showToolbar',
            'app:destroy' : 'destroy',
            'selection:update' : 'handleSelectionChange',
            // 'selection:start' : 'handleSelectStart',
            'selection:change' : 'handleSelectionChange',
            'mouse:down': 'handleMouseDown',
            'mouse:up': 'handleMouseUp',
            'import:from:canvas:complete' : 'handleCanvasImport'
        },
        domEvents: {
            'click' : 'handleToolbarClick',
            'mouseover' : 'handleMouseOver',
            'mouseout' : 'handleMouseOut'
        }
    },
    methods: {
        setup () {
            this.appendStyles();
            this.render();
        },

        init () {
            this.updateToolbarState();
        },

        appendStyles () {
            const { props } = this;
            props.styles = DOM.addStyles(toolbarStyles);
        },

        render () {
            const { mediator, props } = this;
            const buttonConfigs = this.getButtonConfigs();
            const wrapperEl = document.createElement('div');

            let toolbarHTML = toolbarTemplate(buttonConfigs);

            if (typeof toolbarHTML === 'string') {
                wrapperEl.innerHTML = toolbarHTML;
            } else {
                wrapperEl.appendChild(toolbarHTML[0]);
            }

            const toolbarEl = wrapperEl.childNodes[0];
            props.flyout = props.flyout || mediator.get('flyout:new');
            props.flyout.clearContent();
            props.flyout.show();
            props.flyout.appendContent(wrapperEl.childNodes[0]);

            return toolbarEl;
        },

        getButtonConfigs () {
            const { mediator } = this;
            return mediator.get('config:toolbar:buttons');
        },

        handleToolbarClick (evnt) {
            const { mediator, props } = this;
            mediator.exec('contenteditable:refocus');
            mediator.exec('selection:reselect');

            const menuItemEl = DOM.getClosest(evnt.target, `.${props.classNames.MENU_ITEM}`);
            const { dataset } = menuItemEl;
            const { configKey } = dataset;
            const buttonConfig = mediator.get('config:toolbar:buttonConfig', configKey);
            const { formatter, opts } = buttonConfig;
            const toolbarMenuItemState = this.getMenuItemState(menuItemEl);

            opts.toggle = buttonConfig.toggles && toolbarMenuItemState.isActive;
            mediator.exec(`format:${formatter}`, opts);
        },

        // handleSelectStart () {
        //     this.hideToolbar();
        // },

        handleSelectionChange () {
            const { props } = this;
            if (props.selectionChangeTimeout) {
                clearTimeout(props.selectionChangeTimeout);
            }
            props.selectionChangeTimeout = setTimeout(() => {
                this.updateToolbarState();
            }, 10);
        },

        handleMouseDown () {
            this.updateToolbarState();
        },

        handleMouseUp () {
            this.updateToolbarState();
        },

        handleMouseOver () {
            const { props } = this;
            props.mouseover += 1;
            props.mouseover = Math.min(1, props.mouseover);
        },

        handleMouseOut () {
            const { props } = this;
            props.mouseover -= 1;
            props.mouseover = Math.max(0, props.mouseover);
        },

        handleCanvasImport () {
            this.updateToolbarState();
        },

        hideToolbar () {
            const { props } = this;
            props.flyout.hide();
        },

        showToolbar () {
            this.render();
        },

        positionToolbar () {
            const { mediator, props } = this;
            const selectionBounds = mediator.get('selection:bounds');

            if (selectionBounds.initialWidth > 0) {
                const scrollOffset = DOM.getScrollOffset();
                const docRelTop = selectionBounds.top + scrollOffset.y;
                const docRelLeft = selectionBounds.initialLeft + scrollOffset.x;
                const docRelCenter = selectionBounds.initialWidth / 2 + docRelLeft;

                props.flyout.position({
                    left: docRelCenter + 'px',
                    top: docRelTop + 'px'
                });
            }
        },

        updateToolbarState () {
            const { mediator, props } = this;
            const currentSelection = mediator.get('selection:current');
            const linkFormatterActive = mediator.get('format:link:active');
            const mouseIsDown = mediator.get('mouse:is:down');

            if (
                !currentSelection ||
                currentSelection.isCollapsed ||
                !currentSelection.toString().trim().length ||
                linkFormatterActive ||
                !document.activeElement.hasAttribute('contenteditable') ||
                mouseIsDown
            ) {
                if (props.mouseover) {
                    return;
                }
                this.hideToolbar();
            } else {
                this.positionToolbar();
                this.showToolbar();
                this.updateMenuItems();
            }
        },

        updateMenuItems () {
            const { dom, mediator } = this;
            mediator.exec('selection:ensure:text:only');
            for (let i = 0; i < dom.toolbarMenuItems.length; i++) {
                let toolbarMenuItem = dom.toolbarMenuItems[i];
                this.updateMenuItemState(toolbarMenuItem);
            }
        },

        updateMenuItemState (toolbarMenuItem) {
            const { props } = this;
            const toolbarMenuItemState = this.getMenuItemState(toolbarMenuItem);

            if (toolbarMenuItemState.isDisabled) {
                toolbarMenuItem.setAttribute('disabled', '');
            } else {
                toolbarMenuItem.removeAttribute('disabled');
            }

            DOM.toggleClass(toolbarMenuItem, props.classNames.ACTIVE, toolbarMenuItemState.isActive);
        },

        getMenuItemState (toolbarMenuItem) {
            const { mediator } = this;
            const { configKey } = toolbarMenuItem.dataset;

            const config = mediator.get('config:toolbar:buttonConfig', configKey);

            const activeIn = config.activeIn || [];
            const disabledIn = config.disabledIn || [];
            const isActive = mediator.get('selection:in:or:contains', activeIn);

            let isDisabled = false;
            if (typeof disabledIn === 'function') {
                isDisabled = disabledIn.call(config, mediator);
            } else {
                isDisabled = mediator.get('selection:in:or:contains', disabledIn);
            }

            return {
                isActive,
                isDisabled
            };
        },

        destroy () {
            const { props } = this;
            props.flyout.remove();
        }
    }
});

export default Toolbar;
