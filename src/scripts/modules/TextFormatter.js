// jshint strict: false

/**
 * TextFormatter -
 * Responsible for handling formatting for inline text. Bold. Italic.
 * @access protected
 * @module modules/TextFormatter
 *
 * @example
 * mediator.exec('format:text', { style: 'bold' });
 * mediator.exec('format:text', { style: 'italic' });
 */
import Module from '../core/Module';

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
            const { mediator } = this;
            mediator.exec('commands:exec', {
                command: opts.style
            });
        },

        postProcess () {
            const { mediator } = this;

            mediator.exec('contenteditable:refocus');
            // mediator.exec('selection:reselect');
        }
    }
});

export default TextFormatter;
