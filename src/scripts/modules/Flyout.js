// jshint strict: false

/**
 * Flyout -
 * A utility module to control the flyout DOM element that is used to wrap tooltips
 * and floating toolbars.
 * @access protected
 * @module modules/Flyout
 *
 * @example
 * const flyout = mediator.get('flyout:new');
 * flyout.clearContent();
 * flyout.show();
 * flyout.appendContent(domElement);
 * flyout.position({ left: '100px', top: '100px' });
 * flyout.setPlacement('above'); // or 'below'
 *
 * // ... later ...
 * flyout.hide();
 * flyout.remove();
 */
import Module from '../core/Module';
import DOM from '../utils/DOM';

import flyoutTemplate from '../../templates/flyout.html';
import flyoutStyles from '../../styles/flyout.scss';

const Flyout = Module({
    name: 'Flyout',
    dom: {},
    props: {
        minZIndex: 90,
        styles: null,
        flyouts: []
    },
    handlers: {
        requests: {
            'flyout:new' : 'newFlyout'
        },
        commands: {},
        events: {
            'app:destroy' : 'destroy'
        }
    },
    methods: {
        setup () {
            this.appendStyles();
        },

        init () {},

        appendStyles () {
            const { props } = this;
            props.styles = DOM.addStyles(flyoutStyles);
        },

        newFlyout () {
            const { props } = this;
            const flyout = this.buildFlyout();
            props.flyouts.push(flyout);
            return flyout;
        },

        buildFlyout () {
            const flyout = {
                el: this.buildTemplate(),
                appended: null
            };

            flyout.contentEl = flyout.el.querySelector('.typester-flyout-content');

            flyout.clearContent = () => {
                flyout.contentEl.innerHTML = '';
            };

            flyout.appendContent = (content) => {
                return DOM.appendTo(flyout.contentEl, content);
            };
            flyout.show = () => {
                this.showFlyout(flyout);
            };
            flyout.remove = () => {
                this.removeFlyout(flyout);
            };
            flyout.hide = () => {
                this.hideFlyout(flyout);
            };
            flyout.position = (coordinates) => {
                this.positionFlyout(flyout, coordinates);
            };
            flyout.setPlacement = (placement) => {
                this.setPlacement(flyout, placement);
            };

            return flyout;
        },

        buildTemplate () {
            const wrapperEl = document.createElement('div');
            let flyoutHTML, flyoutEl;

            flyoutHTML = flyoutTemplate();
            if (typeof flyoutHTML === 'string') {
                wrapperEl.innerHTML = flyoutHTML;
            } else {
                wrapperEl.appendChild(flyoutHTML[0]);
            }
            flyoutEl = wrapperEl.childNodes[0];

            return flyoutEl;
        },

        appendFlyout (flyout) {
            DOM.appendTo(document.body, flyout.el);
        },

        removeFlyout (flyout) {
            if (flyout.appended) {
                DOM.removeNode(flyout.el);
                flyout.appended = false;
            }
        },

        positionFlyout (flyout, coordinates) {
            const { mediator, props } = this;
            const contentEditableEl = mediator.get('contenteditable:element');
            const containerZIndex = Math.max(props.minZIndex, DOM.getContainerZIndex(contentEditableEl));

            Object.keys(coordinates).forEach((coordinateKey) => {
                flyout.el.style[coordinateKey] = coordinates[coordinateKey];
            });

            flyout.el.style.zIndex = containerZIndex + 1;
        },

        setPlacement (flyout, placement='above') {
            flyout.el.classList.remove('place-below');
            flyout.el.classList.remove('place-above');
            flyout.el.classList.add(`place-${placement}`);
        },

        showFlyout (flyout) {
            if (!flyout.appended) {
                this.appendFlyout(flyout);
                flyout.appended = true;
            } else {
                flyout.el.style.display = 'block';
            }

            setTimeout(() => {
                this.ensureFlyoutInView(flyout);
            }, 17);
        },

        ensureFlyoutInView (flyout) {
            const flyoutBounds = flyout.el.getBoundingClientRect();
            const flyoutArrow = flyout.el.querySelector('.typester-flyout-arrow');

            if (flyoutBounds.left < 0) {
                flyout.el.style.left = flyoutBounds.width / 2 + 10 + 'px';
                flyoutArrow.style.left = flyoutBounds.width / 2 - Math.abs(flyoutBounds.left) - 10 + 'px';
            } else if (flyoutBounds.right > window.innerWidth) {
                const rightOffset = window.innerWidth - flyoutBounds.right;
                flyout.el.style.left = window.innerWidth - (flyoutBounds.width / 2) - 10 + 'px';
                flyoutArrow.style.left = flyoutBounds.width / 2 + Math.abs(rightOffset) + 10 + 'px';
            } else {
                flyoutArrow.style.left = null;
            }
        },

        hideFlyout (flyout) {
            flyout.el.style.display = 'none';
        },

        destroy () {
            const { props } = this;
            props.flyouts.forEach((flyout) => {
                flyout.remove();
            });
        }

    }
});

export default Flyout;
