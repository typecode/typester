// jshint strict: false

import Module from '../core/Module';

/**
* @access protected
*/
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
            // document.body.onmouseout = () => {
            //     props.mousedown = 0;
            // };
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