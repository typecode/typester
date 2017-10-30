// jshint strict: false

import Module from '../core/Module';
import commands from '../utils/commands';

const Formatter = Module({
    name: 'Formatter',
    requiredProps: ['contextWindow'],
    props: {
        contextWindow: null
    },
    handlers: {
        commands: {
            'format:default': 'formatDefault',
            'format:block': 'formatBlock'
        },
        events: {
            'contenteditable:keyup:enter' : 'handleNewLine'
        }
    },
    methods: {
        init () {
        },

        // Event Handlers
        handleNewLine () {
            this.formatDefault();
        },

        formatDefault () {
            commands.defaultBlockFormat();
        },

        formatBlock (opts) {
            commands.formatBlock(opts.style);
        }
    }
});

export default Formatter;
