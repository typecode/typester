// jshint strict: false

import Module from '../core/Module';
import commands from '../utils/commands';
import DOM from '../utils/DOM';

const BlockFormatter = Module({
    name: 'BlockFormatter',
    props: {
        selectionRootEl: null
    },
    handlers: {
        commands: {
            'format:block': 'formatBlock'
        },
        events: {}
    },
    methods: {
        init () {},

        formatBlock (opts) {
            this.preProcess(opts);
            this.process(opts);
            this.commit(opts);
        },

        preProcess () {
            const { mediator } = this;
            mediator.exec('format:export:to:canvas');
        },

        process (opts) {
            const { mediator } = this;
            const canvasDoc = mediator.get('canvas:document');

            if (opts.toggle) {
                if (opts.style === 'BLOCKQUOTE') {
                    commands.exec('outdent', null, canvasDoc);
                }
                commands.defaultBlockFormat(canvasDoc);
            } else {
                commands.formatBlock(opts.style, canvasDoc);
            }
        },

        commit (opts) {
            const { mediator, cleanupBlockquote } = this;
            const importFilter = opts.style === 'BLOCKQUOTE' ? cleanupBlockquote : null;
            mediator.exec('format:import:from:canvas', { importFilter });
        },

        cleanupBlockquote (rootElem) {
            const blockquoteParagraphs = rootElem.querySelectorAll('BLOCKQUOTE P');
            blockquoteParagraphs.forEach((paragraph) => {
                DOM.unwrap(paragraph);
            });
        }
    }
});

export default BlockFormatter;
