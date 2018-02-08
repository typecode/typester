// jshint strict: false

/**
 * BlockFormatter -
 * Formatter responsible for handling block level formatting for: P, Blockquote
 * H1, H2, H3, etc.
 *
 * @access protected
 * @module modules/BlockFormatter
 *
 * @example
 * // Available commands
 * commands: {
 *   'format:block': 'formatBlock'
 * }
 *
 * mediator.exec('format:block', { style: 'H1' }); // Format selection to a H1 heading
 * mediator.exec('format:block', { style: 'BLOCKQUOTE' }); // Format selection to a blockquote
 *
 * // Other options include
 * { style: 'H1' } // H2, H3...H6
 * { style: 'P' }
 * { style: 'BLOCKQUOTE' }
 * { style: 'PRE' }
 */

import Module from '../core/Module';
import commands from '../utils/commands';
import DOM from '../utils/DOM';

/**
* @access protected
*/
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
