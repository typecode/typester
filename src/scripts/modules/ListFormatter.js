// jshint strict: false

import Module from '../core/Module';
import commands from '../utils/commands';
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
            let toggle = false;

            mediator.exec('canvas:cache:selection');
            switch (opts.style) {
            case 'ordered':
                toggle = mediator.get('selection:in:or:contains', ['OL']);
                if (toggle) {
                    // this.prepListItemsForToggle();
                    // while (mediator.get('canvas:selection:in:or:contains', ['OL'])) {
                    //     commands.exec('outdent', null, canvasDoc);
                    // }
                    // commands.exec('insertOrderedList', null, canvasDoc);
                    // return;
                } else if (mediator.get('selection:in:or:contains', ['UL'])) {
                    commands.exec('insertUnorderedList', null, canvasDoc);
                }
                commands.exec('insertOrderedList', null, canvasDoc);
                break;
            case 'unordered':
                toggle = mediator.get('selection:in:or:contains', ['UL']);
                if (toggle) {
                    // this.prepListItemsForToggle();
                    // while (mediator.get('canvas:selection:in:or:contains', ['UL'])) {
                    //     commands.exec('outdent', null, canvasDoc);
                    // }
                    // commands.exec('insertUnorderedList', null, canvasDoc);
                    // return;
                }
                if (mediator.get('selection:in:or:contains', ['OL'])) {
                    commands.exec('insertOrderedList', null, canvasDoc);
                }
                commands.exec('insertUnorderedList', null, canvasDoc);
                break;
            case 'outdent':
                commands.exec('outdent', null, canvasDoc);
                break;
            case 'indent':
                commands.exec('indent', null, canvasDoc);
                break;
            }

            if (toggle) {
                // mediator.exec('canvas:select:cachedSelection');
                this.postProcessToggle(opts);
            } else {
                mediator.exec('canvas:select:ensure:offsets');
            }

            // mediator.exec('canvas:select:cachedSelection');
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
                    // this.formatList({ style: 'outdent' });
                } else {
                    // this.formatList({ style: 'indent' });
                }
            }
        },

        prepListItemsForToggle () {
            const { mediator } = this;

            const canvasDoc = mediator.get('canvas:document');
            const canvasBody = mediator.get('canvas:body');

            const {
                anchorNode,
                focusNode,
            } = mediator.get('canvas:selection');

            const anchorLiNode = DOM.getClosest(anchorNode, 'LI', canvasBody);
            const focusLiNode = DOM.getClosest(focusNode, 'LI', canvasBody);

            mediator.exec('canvas:cache:selection');

            let selectedLiNodes = [anchorLiNode];
            let nextLiNode = anchorLiNode.nextSibling;
            while (nextLiNode && nextLiNode !== focusLiNode) {
                selectedLiNodes.push(nextLiNode);
                nextLiNode = nextLiNode.nextSibling;
            }
            selectedLiNodes.push(focusLiNode);

            selectedLiNodes.forEach((selectedLiNode) => {
                let contentWrapper = canvasDoc.createElement('span');
                selectedLiNode.appendChild(contentWrapper);
                while (selectedLiNode.firstChild !== contentWrapper) {
                    contentWrapper.appendChild(selectedLiNode.firstChild);
                }
            });

            mediator.exec('canvas:select:cachedSelection');

            return;
            // const canvasBody = mediator.get('canvas:body');
            // const canvasDoc = mediator.get('canvas:document');
            //
            // let rootBlock = anchorNode;
            // while(rootBlock.parentNode !== canvasBody) {
            //     rootBlock = rootBlock.parentNode;
            // }
            //
            // const liNodes = rootBlock.querySelectorAll('li');
            // liNodes.forEach((liNode) => {
            //     let pNode = canvasDoc.createElement('span');
            //     liNode.appendChild(pNode);
            //     while (liNode.firstChild !== pNode) {
            //         pNode.appendChild(liNode.firstChild);
            //     }
            // });
        },

        postProcessToggle () {
            const { mediator } = this;
            // return;

            const canvasDoc = mediator.get('canvas:document');
            const canvasBody = mediator.get('canvas:body');

            mediator.exec('canvas:cache:selection');

            const {
                anchorNode,
                focusNode
            } = mediator.get('canvas:selection');

            const walkToRoot = function (node) {
                let rootNode = node;
                while ( rootNode.parentNode !== canvasBody ) {
                    rootNode = rootNode.parentNode;
                }
                return rootNode;
            };

            const anchorRootNode = walkToRoot(anchorNode);
            const focusRootNode = walkToRoot(focusNode);

            let currentNode = anchorRootNode;
            let currentParagraph;

            const createParagraph = function () {
                currentParagraph = canvasDoc.createElement('p');
                DOM.insertBefore(currentParagraph, currentNode);
            };

            const handleBrNode = function (brNode) {
                createParagraph();
                currentNode = brNode.nextSibling;
                DOM.removeNode(brNode);
            };

            const handleDivNode = function (divNode) {
                createParagraph();
                currentNode = divNode.nextSibling;
                while (divNode.firstChild) {
                    currentParagraph.appendChild(divNode.firstChild);
                }
                DOM.removeNode(divNode);
            };

            createParagraph();

            while (currentNode !== focusRootNode) {
                if (currentNode.nodeName === 'BR') {
                    handleBrNode(currentNode);
                } else if (currentNode.nodeName === 'DIV') {
                    handleDivNode(currentNode);
                } else {
                    let orphanedNode = currentNode;
                    currentNode = currentNode.nextSibling;
                    currentParagraph.appendChild(orphanedNode);
                }
            }

            if (focusRootNode.nodeName === 'DIV') {
                handleDivNode(focusRootNode);
            } else {
                currentParagraph.appendChild(focusRootNode);
            }

            mediator.exec('canvas:select:cachedSelection');
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
