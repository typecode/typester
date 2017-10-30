// jshint strict: false

import Module from '../core/Module';
import commands from '../utils/commands';

const TextFormatter = Module({
    name: 'TextFormatter',
    props: {
        cachedRange: null
    },
    handlers: {
        requests: {},
        commands: {
            'format:text' : 'formatText'
        },
        events: {}
    },
    methods: {
        formatText (opts) {
            this.preProcess();
            this.process(opts);
            this.postProcess();
        },

        preProcess () {
            const { mediator } = this;
            mediator.exec('contenteditable:refocus');
            mediator.exec('selection:reselect');
        },

        process (opts) {
            commands.exec(opts.style, null);
        },

        postProcess () {
            const { mediator } = this;

            mediator.exec('contenteditable:refocus');
            // mediator.exec('selection:reselect');
        }
    }
});

export default TextFormatter;
