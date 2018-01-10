// jshint strict: false

/**
 * UIContainer - Initializes and bootstraps the UI modules. It requires only a
 * mediator instance to delegate events to.
 *
 * @access protected
 * @module containers/UIContainer
 *
 * @requires core/Container
 * @requires modules/Toolbar
 * @requires modules/Flyout
 * @requires modulesMouse
 *
 * @example
 * new UIContainer({ mediator: mediatorInstance });
 */
import Container from '../core/Container';
import Toolbar from '../modules/Toolbar';
import Flyout from '../modules/Flyout';
import Mouse from '../modules/Mouse';

/**
 * @constructor UIContainer
 * @param {object} opts={} - container options
 * @param {mediator} opts.mediator - The mediator to delegate events to
 * @return {container} UIContainer instance
 */
const UIContainer = Container({
    name: 'UIContainer',

    /**
     * Child Modules: [{@link modules/Flyout}, {@link modules/Toolbar}]
     * Note: The Toobar is instantiated with the document body set as it's dom.el.
     * @enum {Array<{class:Module}>} modules    
     */
    modules: [
        {
            class: Flyout
        },
        {
            class: Toolbar,
            opts: {
                dom: {
                    el: document.body
                }
            }
        },
        {
            class: Mouse
        }
    ]
});

export default UIContainer;
