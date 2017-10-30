// jshint strict: false

import Container from '../core/Container';

import UIContainer from '../containers/UIContainer';
import FormatterContainer from '../containers/FormatterContainer';
import CanvasContainer from '../containers/CanvasContainer';

import ContentEditable from '../modules/ContentEditable';
import Selection from '../modules/Selection';

let uiContainer, formatterContainer, canvasContainer;

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
        setup () {
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
