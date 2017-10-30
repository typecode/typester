// jshint strict: false

import Container from '../core/Container';

import Toolbar from '../modules/Toolbar';
import Flyout from '../modules/Flyout';
import Mouse from '../modules/Mouse';

const UIContainer = Container({
    name: 'UIContainer',
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
