// jshint strict: false

import Container from '../core/Container';

import UIContainer from '../containers/UIContainer';
import FormatterContainer from '../containers/FormatterContainer';
import CanvasContainer from '../containers/CanvasContainer';

import ContentEditable from '../modules/ContentEditable';
import Selection from '../modules/Selection';

let uiContainer, formatterContainer, canvasContainer;


/**
 * ### AppContainer
 * The top most container for the Typester app stack. This
 * container sets up the {@link FormatterContainer}, {@link UIContainer},
 * and {@link CanvasContainer} containers which in return setup various
 * modules that make up the app stack.
 *
 *
 *
 * @access protected
 * @param  {object} opts={} - instance options
 * @param  {object} opts.dom - The dom components used by Typester
 * @param  {element} opts.dom.el - The dom element to be the canvas for Typester
 * @return {appContainer} AppContainer instance
 *
 * @example
 * new AppContainer({
 *   dom: {
 *     el: domElement
 *   }
 * });
 */
const AppContainer = Container({
    name: 'AppContainer',
    modules: [
        {
            class: ContentEditable
        },
        {
            class: Selection
        }
    ],
    handlers: {
        events: {
            'contenteditable:focus': 'handleFocus',
            'contenteditable:blur': 'handleBlur'
        }
    },
    methods: {
        /**
         *
         */
        setup: function () {
            const { mediator } = this;
            formatterContainer = formatterContainer || new FormatterContainer({ mediator });
            uiContainer = uiContainer || new UIContainer({ mediator });
            canvasContainer = canvasContainer || new CanvasContainer({ mediator });
        },

        init () {
        },

        handleFocus () {
            const { mediator } = this;
            uiContainer.setMediatorParent(mediator);
            formatterContainer.setMediatorParent(mediator);
            canvasContainer.setMediatorParent(mediator);
        },

        handleBlur () {
            // Should the container require to do anything in particular here
        }
    }
});

export default AppContainer;
