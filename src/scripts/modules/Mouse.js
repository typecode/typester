// jshint strict: false

 /**
  * Mouse -
  * Responsible for tracking the up/down state of the mouse button
  * @access protected
  * @module modules/Mouse
  *
  * @example
  * mediator.get('mouse:is:down'); // Returns true if mouse button is down.
  */

import Module from '../core/Module';

const Mouse = Module({
    name: 'Mouse',
    props: {
        mousedown: 0
    },
    dom: {},
    handlers: {
        requests: {
            'mouse:is:down': 'mouseIsDown'
        },
        commands: {},
        events: {
            'contenteditable:blur': 'handleContentEditableBlur'
        }
    },
    methods: {
        init () {
            const { mediator } = this;
            document.body.onmousedown = () => {
                this.setMousedown();
                mediator.emit('mouse:down');
            };
            document.body.onmouseup = () => {
                this.unsetMousedown();
                mediator.emit('mouse:up');
            };
        },

        setMousedown () {
            const { props } = this;
            props.mousedown += 1;
            props.mousedown = Math.min(1, props.mousedown);
        },

        unsetMousedown () {
            const { props } = this;
            props.mousedown -= 1;
            props.mousedown = Math.max(0, props.mousedown);
        },

        mouseIsDown () {
            const { props } = this;
            return !!props.mousedown;
        },

        handleContentEditableBlur () {
            const { props } = this;
            props.mousedown = 0;
        }
    }
});

export default Mouse;
