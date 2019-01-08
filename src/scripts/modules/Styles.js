// jshint strict: false

/**
 * Styles -
 * Handle the creation and embedding of custom styles.
 * @access protected
 * @module modules/Styles
 */

import Module from '../core/Module';

const Styles = Module({
    name: 'Styles',

    props: {
        stylesheet: null,
    },

    handlers: {
        events: {
            'app:destroy': 'destroy'
        }
    },

    methods: {
        setup () {
            this.createStylesheet();
        },

        init () {
            const { mediator } = this;
            const config = mediator.get('config:styles');
            let stylesheetContent = this.stylesTemplate(config);

            this.appendStylesheet();
            this.updateStylesheet(stylesheetContent);
        },

        stylesTemplate (config) {
            return `
                .typester-toolbar .typester-menu-item,
                .typester-input-form input[type=text],
                .typester-link-display a,
                .typester-input-form button {
                    color: ${config.colors.menuItemIcon};
                }

                .typester-toolbar .typester-menu-item svg,
                .typester-link-display .typester-link-edit svg,
                .typester-input-form button svg {
                    fill: ${config.colors.menuItemIcon};
                }

                .typester-input-form button svg {
                    stroke: ${config.colors.menuItemIcon};
                }

                .typester-toolbar .typester-menu-item:hover,
                .typester-link-display .typester-link-edit:hover
                .typester-input-form button:hover {
                    background: ${config.colors.menuItemHover};
                }

                .typester-toolbar .typester-menu-item.s--active {
                    background: ${config.colors.menuItemActive};
                }

                .typester-flyout .typester-flyout-content {
                    background: ${config.colors.flyoutBg};
                }

                .typester-flyout.place-above .typester-flyout-arrow {
                    border-top-color: ${config.colors.flyoutBg};
                }

                .typester-flyout.place-below .typester-flyout-arrow {
                    border-bottom-color: ${config.colors.flyoutBg};
                }
            `;
        },

        createStylesheet () {
            this.stylesheet = document.createElement('style');
        },

        appendStylesheet () {
            document.head.appendChild(this.stylesheet);
        },

        updateStylesheet (stylesheetContent) {
            this.stylesheet.textContent = stylesheetContent;
        },

        removeStylesheet () {
            document.head.removeChild(this.stylesheet);
        },

        destroy () {
            this.removeStylesheet();
        }
    }
});

export default Styles;
