// jshint strict: false

/**
 * AppContainer - The top most container for the Typester app stack. This
 * container sets up the {@link FormatterContainer}, {@link UIContainer},
 * and {@link CanvasContainer} containers which are treated as singletons.
 *
 * @access protected
 * @module containers/AppContainer
 *
 * @requires core/Container
 * @requires containers/UIContainer
 * @requires containers/FormatterContainer
 * @requires containers/CanvasContainer
 * @requires modules/ContentEditable
 * @requires modules/Selection
 *
 * @example
 * new AppContainer({
 *   dom: {
 *     el: domElement
 *   }
 * });
 */


import Container from '../core/Container';
import UIContainer from '../containers/UIContainer';
import FormatterContainer from '../containers/FormatterContainer';
import CanvasContainer from '../containers/CanvasContainer';
import ContentEditable from '../modules/ContentEditable';
import Selection from '../modules/Selection';

let uiContainer, formatterContainer, canvasContainer;

/**
 * @constructor AppContainer
 * @param  {object} opts={} - instance options
 * @param  {object} opts.dom - The dom components used by Typester
 * @param  {element} opts.dom.el - The dom element to be the canvas for Typester
 * @return {container} AppContainer instance
 */
const AppContainer = Container({
    name: 'AppContainer',

    /**
     * Child modules: [{@link modules/ContentEditable}, {@link modules/Selection}]
     * @enum {Array<{class:Module}>} modules
     */
    modules: [
        {
            class: ContentEditable
        },
        {
            class: Selection
        }
    ],


    /**
     * @prop {Object} handlers
     * @prop {Object} handlers.events - AppContainer listens to events from {@link ContentEditable}
     */
    handlers: {
        events: {
            'contenteditable:focus': 'handleFocus',
            'contenteditable:blur': 'handleBlur'
        }
    },
    methods: {
        /**
         * @func setup
         * @desc Initializes the {@link FormatterContainer} and provides a mediator
         * to attach to.
         * @protected
         */
        setup: function () {
            const { mediator } = this;
            formatterContainer = formatterContainer || new FormatterContainer({ mediator });
            uiContainer = uiContainer || new UIContainer({ mediator });
            canvasContainer = canvasContainer || new CanvasContainer({ mediator });
        },

        /**
         * Nothing to see here.
         * @func init
         * @ignore
         */
        init () {
            // Current nothing to init for this container. Method left here for ref.
        },

        /**
         * Because the {@link FormatterContainer}, {@link UIContainer},
         * and {@link CanvasContainer} containers are intended to be singletons
         * they need to communicate through the current active mediator instance.
         *
         * @method handleFocus
         * @listens contenteditable:focus
         */
        handleFocus () {
            const { mediator } = this;
            uiContainer.setMediatorParent(mediator);
            formatterContainer.setMediatorParent(mediator);
            canvasContainer.setMediatorParent(mediator);
        },

        /**
         * Nothing to see here.
         * @func handleBlur
         * @ignore
         */
        handleBlur () {
            // Should the container require to do anything in particular here
        }
    }
});

export default AppContainer;
