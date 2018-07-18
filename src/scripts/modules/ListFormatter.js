// jshint strict: false


/**
 * ListFormatter -
 * Responsible for the creation, cleanup, and removal of lists.
 * @access protected
 * @module modules/ListFormatter
 *
 * @example
 * mediator.exec('format:list', { style: 'ordered'}); // Toggle ordered list on current selection
 * mediator.exec('format:list', { style: 'unordered'}); // Toggle unordered list on current selection
 * mediator.exec('format:list:cleanup', domElement); // Find all lists and clean them up
 */
import Module from '../core/Module';
import DOM from '../utils/DOM';

const ListFormatter = Module({
    name: 'ListFormatter',
    props: {},
    dom: {},
    handlers: {
        requests: {},
        commands: {
            'format:list': 'formatList',
            'format:list:cleanup': 'cleanupListDOM'
        },
        events: {
            'contenteditable:tab:down': 'handleTabDown',
            'contenteditable:tab:up': 'handleTabUp'
        }
    },
    methods: {
        init () {},
        formatList (opts) {
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

            mediator.exec('canvas:cache:selection');

            switch (opts.style) {
            case 'ordered':
                if (mediator.get('selection:in:or:contains', ['UL'])) {
                    mediator.exec('commands:exec', {
                        command: 'insertUnorderedList',
                        contextDocument: canvasDoc
                    });
                }
                mediator.exec('commands:exec', {
                    command: 'insertOrderedList',
                    contextDocument: canvasDoc
                });
                break;

            case 'unordered':
                if (mediator.get('selection:in:or:contains', ['OL'])) {
                    mediator.exec('commands:exec', {
                        command: 'insertOrderedList',
                        contextDocument: canvasDoc
                    });
                }
                mediator.exec('commands:exec', {
                    command: 'insertUnorderedList',
                    contextDocument: canvasDoc
                });
                break;

            case 'outdent':
                mediator.exec('commands:exec', {
                    command: 'outdent',
                    contextDocument: canvasDoc
                });
                break;

            case 'indent':
                mediator.exec('commands:exec', {
                    command: 'indent',
                    contextDocument: canvasDoc
                });
                break;
            }

            mediator.exec('canvas:select:ensure:offsets');
        },

        commit () {
            const { mediator, cleanupListDOM } = this;
            mediator.exec('format:import:from:canvas', {
                importFilter: cleanupListDOM
            });
        },

        handleTabDown (evnt) {
            const { mediator } = this;
            const isInList = mediator.get('selection:in:or:contains', ['UL', 'OL']);

            if (isInList) {
                evnt.preventDefault();
            }
        },

        handleTabUp (evnt) {
            const { mediator } = this;
            const isInList = mediator.get('selection:in:or:contains', ['UL', 'OL']);


            if (isInList) {
                evnt.preventDefault();

                if (evnt.shiftKey) {
                    this.formatList({ style: 'outdent' });
                } else {
                    this.formatList({ style: 'indent' });
                }
            }
        },

        cleanupListDOM (rootElem) {
            const listContainers = rootElem.querySelectorAll('OL, UL');

            for (let i = listContainers.length - 1; i >= 0; i--) {
                let listContainer = listContainers[i];
                if (['OL', 'UL'].indexOf(listContainer.parentNode.nodeName) > -1) {
                    if (listContainer.previousSibling) {
                        if (listContainer.previousSibling.nodeName === 'LI') {
                            listContainer.previousSibling.appendChild(listContainer);
                        }

                        if (['OL', 'UL'].indexOf(listContainer.previousSibling.nodeName) > -1) {
                            for (let j = 0; j <= listContainer.childNodes.length; j++) {
                                listContainer.previousSibling.appendChild(listContainer.childNodes[j]);
                            }
                            DOM.removeNode(listContainer);
                        }
                    } else {
                        DOM.unwrap(listContainer);
                    }
                } else {
                    while (listContainer.parentNode && listContainer.parentNode !== rootElem && ['LI'].indexOf(listContainer.parentNode.nodeName) < 0) {
                        DOM.insertBefore(listContainer, listContainer.parentNode);
                    }
                }
            }

            const nestedListItems = rootElem.querySelectorAll('LI > LI');
            for (let i = nestedListItems.length - 1; i >= 0; i--) {
                let nestedListItem = nestedListItems[i];
                DOM.insertAfter(nestedListItem, nestedListItem.parentNode);
            }
        }
    }
});

export default ListFormatter;
