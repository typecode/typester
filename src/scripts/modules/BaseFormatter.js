// jshint strict: false


/**
 * BaseFormatter -
 * A collection of the common formatter methods.
 * @access protected
 * @module modules/BaseFormatter
 *
 * @example
 * // Available commands
 * commands: {
 *     'format:export:to:canvas': 'exportToCanvas',
 *     'format:import:from:canvas': 'importFromCanvas',
 *     'format:default': 'formatDefault',
 *     'format:clean': 'formatClean'
 * }
 *
 * // Usage
 * mediator.exec('format:export:to:canvas'); // Export editor's content to canvas
 * mediator.exec('format:import:from:canvas'); // Import content from canvas
 * mediator.exec('format:default'); // Apply the default block formatting to the selection
 * mediator.exec('format:clean', elem); // Clean the HTML inside elem
 */
import Module from '../core/Module';
import DOM from '../utils/DOM';
import zeroWidthSpace from '../utils/zeroWidthSpace';

let validTags, blockTags, listTags;

const BaseFormatter = Module({
    name: 'BaseFormatter',
    props: {},
    handlers: {
        requests: {},
        commands: {
            'format:export:to:canvas': 'exportToCanvas',
            'format:import:from:canvas': 'importFromCanvas',
            'format:default': 'formatDefault',
            'format:clean': 'formatClean'
        },
        events: {
            'contenteditable:newline': 'handleNewLine'
        }
    },
    methods: {
        init () {
            const { mediator } = this;
            validTags = mediator.get('config:toolbar:validTags');
            blockTags = mediator.get('config:toolbar:blockTags');
            listTags  = mediator.get('config:toolbar:listTags');
        },

        /**
         * @func exportToCanvas
         * @access protected
         * @description mediator.exec("format:export:to:canvas") - Selects the content from the current editor root element and
         * sends it to the canvas
         */
        exportToCanvas () {
            const { mediator } = this;
            const rootElement = mediator.get('selection:rootelement');
            const canvasBody = mediator.get('canvas:body');
            this.injectHooks(rootElement);

            const rangeCoordinates = mediator.get('selection:range:coordinates');
            const clonedNodes = DOM.cloneNodes(rootElement, { trim: true });

            mediator.exec('canvas:content', clonedNodes);
            mediator.exec('canvas:select:by:coordinates', rangeCoordinates);

            this.removeZeroWidthSpaces(canvasBody);
        },

        /**
         * @func importFromCanvas
         * @access protected
         * @description mediator.exec("format:import:from:canvas", { importFilter() }) - Imports the content from the canvas and replaces the current editor's
         * content via a past execCommand
         * @param  {method} opts.importFilter optional - a filter method that will be given a reference to the canvasBody allowing for custom manipulation of the formatted content.
         */
        importFromCanvas (opts={}) {
            const { mediator } = this;
            const canvasBody = mediator.get('canvas:body');

            mediator.exec('canvas:cache:selection');
            mediator.exec('format:clean', canvasBody);
            if (opts.importFilter) {
                opts.importFilter(canvasBody);
            }
            mediator.exec('canvas:select:cachedSelection');

            const canvasSelectionCoordinates = mediator.get('canvas:selection:coordinates');
            mediator.exec('selection:select:all');
            mediator.exec('canvas:export:all');
            mediator.exec('selection:select:coordinates', canvasSelectionCoordinates);

            mediator.emit('import:from:canvas:complete');
        },

        /**
         * @func formatDefault
         * @access protected
         * @description mediator.exec("format:default") - Applies the default formatting to the current selection or line
         */
        formatDefault () {
            const { mediator } = this;
            const rootElem = mediator.get('selection:rootelement');
            mediator.exec('commands:format:default');
            this.removeStyledSpans(rootElem);
        },

        /**
         * @func formatClean
         * @access protected
         * @description mediator.exec("format:clean") - Cleans up the html in the current editor.
         */
        formatClean (rootElem) {
            this.unwrapInvalidElements(rootElem);
            this.defaultOrphanedTextNodes(rootElem);
            this.removeBrNodes(rootElem);
            this.ensureRootElems(rootElem);
            this.removeStyleAttributes(rootElem);
            this.removeEmptyNodes(rootElem, { recursive: true });

            // -----

            // this.removeBrNodes(rootElem);
            // // this.removeEmptyNodes(rootElem);
            // this.removeFontTags(rootElem);
            // this.removeStyledSpans(rootElem);
            // this.clearEntities(rootElem);
            // this.removeZeroWidthSpaces(rootElem);
            // this.defaultOrphanedTextNodes(rootElem);
            // this.removeEmptyNodes(rootElem, { recursive: true });
        },

        /**
         * PRIVATE METHODS:
         */
        injectHooks (rootElement) {
            while (!/\w+/.test(rootElement.firstChild.textContent)) {
                DOM.removeNode(rootElement.firstChild);
            }

            while(!/\w+/.test(rootElement.lastChild.textContent)) {
                DOM.removeNode(rootElement.lastChild);
            }

            DOM.insertBefore(zeroWidthSpace.get(), rootElement.firstChild);
            DOM.insertAfter(zeroWidthSpace.get(), rootElement.lastChild);
        },

        formatEmptyNewLine () {
            const { mediator } = this;
            const anchorNode = mediator.get('selection:anchornode');
            const preventNewlineDefault = mediator.get('config:toolbar:preventNewlineDefault');
            const canDefaultNewline = !(anchorNode.innerText && anchorNode.innerText.trim().length) && !DOM.isIn(anchorNode, preventNewlineDefault);
            const anchorIsContentEditable = anchorNode.hasAttribute && anchorNode.hasAttribute('contenteditable');

            if (canDefaultNewline || anchorIsContentEditable) {
                this.formatDefault();
            }
        },

        formatBlockquoteNewLine () {
            const { mediator } = this;

            mediator.exec('commands:exec', {
                command: 'outdent'
            });
            this.formatDefault();

            const currentRangeClone = mediator.get('selection:range').cloneRange();
            const { startContainer } = currentRangeClone;

            if (startContainer.previousSibling && startContainer.previousSibling.nodeName === 'BLOCKQUOTE') {
                const brEls = startContainer.previousSibling.querySelectorAll('br');
                const divEls = startContainer.previousSibling.querySelectorAll('div');

                for (let i = 0; i < brEls.length; i++) {
                    DOM.removeNode(brEls[i]);
                }

                for (let i = 0; i < divEls.length; i++) {
                    DOM.unwrap(divEls[i]);
                }

                mediator.exec('selection:update:range', currentRangeClone);
            }

        },

        handleNewLine () {
            const { mediator } = this;
            const { startContainer } = mediator.get('selection:range');
            const containerIsEmpty = !/\w+/.test(startContainer.textContent);
            const containerIsBlockquote = DOM.isIn(startContainer, 'BLOCKQUOTE');
            const isContentEditable = startContainer.nodeType === Node.ELEMENT_NODE && startContainer.hasAttribute('contenteditable');

            if (containerIsBlockquote) {
                this.formatBlockquoteNewLine();
            } else if (containerIsEmpty || isContentEditable) {
                this.formatEmptyNewLine();
            }
        },

        removeStyleAttributes (rootElem) {
            const styleAttributeNodes = rootElem.querySelectorAll('[style]');
            styleAttributeNodes.forEach((styleAttributeNode) => {
                styleAttributeNode.removeAttribute('style');
            });
        },

        removeBrNodes (rootElem) {
            const brNodes = rootElem.querySelectorAll('br');
            let brNodesToProcess = [];
            let brNodesToRemove = [];

            brNodes.forEach((brNode) => {
                const skipNode = brNode.skipNode;

                if (skipNode) {
                    return;
                }

                const isLastChild = brNode === brNode.parentNode.lastChild;
                const isDoubleBreak = brNode.nextSibling && brNode.nextSibling.nodeName === 'BR';
                const isInBlock = DOM.isIn(brNode, blockTags, rootElem);
                const isOrphan = brNode.parentNode === rootElem;

                if (isLastChild || isOrphan) {
                    brNodesToRemove.push(brNode);
                    return;
                }

                if (isDoubleBreak && isInBlock) {
                    brNodesToProcess.push([
                        brNode,
                        brNode.nextSibling
                    ]);
                    brNode.nextSibling.skipNode = true;
                    return;
                }
            });

            brNodesToProcess.forEach((brNodePair) => {
                const [firstBrNode, secondBrNode] = brNodePair;
                const closestBlock = DOM.getClosestInArray(firstBrNode, blockTags, rootElem);
                const newParagraph = document.createElement('p');
                let previousSibling;

                while ((previousSibling = firstBrNode.previousSibling)) {
                    if (newParagraph.firstChild) {
                        DOM.insertBefore(previousSibling, newParagraph.firstChild);
                    } else {
                        newParagraph.appendChild(previousSibling);
                    }

                    DOM.insertBefore(newParagraph, closestBlock);
                }

                DOM.removeNode(firstBrNode);
                DOM.removeNode(secondBrNode);
            });

            brNodesToRemove.forEach((brNode) => {
                DOM.removeNode(brNode);
            });
        },

        unwrapInvalidElements (rootElem) {
            const rootDoc = rootElem.ownerDocument;
            const walker = rootDoc.createTreeWalker(
                rootElem,
                NodeFilter.SHOW_ELEMENT,
                null,
                false
            );

            let invalidElements = [];
            while (walker.nextNode()) {
                let { currentNode } = walker;
                let isInvalid = validTags.indexOf(currentNode.nodeName) < 0;
                let isBrNode = currentNode.nodeName === 'BR'; // BR nodes are handled elsewhere
                let isTypesterElem = currentNode.className && /typester/.test(currentNode.className);
                let isElement = currentNode.nodeType !== Node.TEXT_NODE;

                if (isInvalid && !isBrNode && !isTypesterElem && isElement) {
                    invalidElements.unshift(currentNode);
                }
            }

            invalidElements.forEach((invalidElement) => {
                let unwrappedNodes = DOM.unwrap(invalidElement, { keepNode: true });
                if (!DOM.isIn(invalidElement, validTags, rootElem) && unwrappedNodes.length) {
                    let newParagraph = rootDoc.createElement('p');
                    unwrappedNodes.forEach((unwrappedNode) => {
                        newParagraph.appendChild(unwrappedNode);
                    });
                    DOM.insertBefore(newParagraph, invalidElement);
                }
                DOM.removeNode(invalidElement);
            });
        },

        defaultOrphanedTextNodes (rootElem) {
            const { childNodes } = rootElem;

            for (let i = 0; i < childNodes.length; i++) {
                let childNode = childNodes[i];
                if (childNode.nodeType === Node.TEXT_NODE && /\w+/.test(childNode.textContent)) {
                    let newParagraph = document.createElement('p');
                    DOM.insertBefore(newParagraph, childNode);
                    newParagraph.appendChild(childNode);
                    while (newParagraph.nextSibling && blockTags.concat(listTags).indexOf(newParagraph.nextSibling.nodeName) < 0) {
                        newParagraph.appendChild(newParagraph.nextSibling);
                    }
                }
            }
        },

        clearEntities (rootElem) {
            const rootDoc = rootElem.ownerDocument;
            const walker = rootDoc.createTreeWalker(
                rootElem,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let textNodes = [];
            while(walker.nextNode()) {
                textNodes.push(walker.currentNode);
            }

            textNodes.forEach((textNode) => {
                if (/\w+/.test(textNode.textContent)) {
                    textNode.nodeValue = textNode.nodeValue.replace(/^\u00a0/, '');
                    textNode.nodeValue = textNode.nodeValue.replace(/\u00a0$/, '');
                }
            });
        },

        ensureRootElems (rootElem) {
            const rootNodeTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'OL', 'UL', 'BLOCKQUOTE', 'P'];
            const nestableTags = [
                {
                    tags: ['OL', 'UL'],
                    validParents: ['OL', 'UL', 'LI']
                },
                {
                    tags: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
                    validParents: ['LI']
                }
            ];
            const rootNodes = rootElem.querySelectorAll(rootNodeTags.join(', '));
            const validNesting = function (node) {
                let validNesting = false;
                nestableTags.forEach((nestingDict) => {
                    if (
                        nestingDict.tags.indexOf(node.tagName) > -1 &&
                        nestingDict.validParents.indexOf(node.parentNode.tagName) > -1
                    ) {
                        validNesting = true;
                    }
                });
                return validNesting;
            };

            const moveNodeToRoot = function (node) {
                if (
                    node.parentNode === rootElem
                ) {
                    return;
                }

                if (validNesting(node)) {
                    return;
                }

                let rootParentNode = node.parentNode;
                if (node.tagName === 'P' && ['LI', 'BLOCKQUOTE'].indexOf(rootParentNode.tagName) > -1) {
                    while (node.firstChild) {
                        DOM.insertBefore(node.firstChild, node);
                    }
                    DOM.removeNode(node);
                    return;
                }

                while (
                    rootParentNode.parentNode !== rootElem
                ) {
                    rootParentNode = rootParentNode.parentNode;
                }

                DOM.insertBefore(node, rootParentNode);
            };

            rootNodes.forEach(moveNodeToRoot);
        },

        removeZeroWidthSpaces (rootElem) {
            rootElem.childNodes.forEach((childNode) => {
                if (
                    childNode.nodeType === Node.TEXT_NODE &&
                    zeroWidthSpace.assert(childNode)
                ) {
                    DOM.removeNode(childNode);
                }
            });
        },

        removeEmptyNodes (rootElem, opts={}) {
            if (rootElem.normalize) {
                rootElem.normalize();
            }

            for (let i = rootElem.childNodes.length - 1; i >= 0; i--) {
                let childNode = rootElem.childNodes[i];

                if (childNode.nodeName === 'BR') {
                    continue;
                }

                if (opts.recursive && childNode.childNodes.length) {
                    this.removeEmptyNodes(childNode, { recursive: true, rootIsChild: true });
                }

                if (!/[\w\.,\/#!$%\^&\*;:{}=\-_`~()\'\"]/.test(childNode.textContent)) {
                    if (
                        (!opts.rootIsChild && !zeroWidthSpace.assert(childNode) && i > 0) ||
                        childNode.nodeType === Node.ELEMENT_NODE
                    ) {
                        DOM.removeNode(childNode);
                    }
                }
            }
        },

        removeStyledSpans (rootElem) {
            const styledSpans = rootElem.querySelectorAll('span[style]');
            for (let i = styledSpans.length - 1; i >= 0; i--) {
                let styledSpan = styledSpans[i];
                while (styledSpan.firstChild) {
                    DOM.insertBefore(styledSpan.firstChild, styledSpan);
                }
                DOM.removeNode(styledSpan);
            }
        },

        removeFontNodes (rootElem) {
            const fontTags = rootElem.querySelectorAll('font');
            for (let i = fontTags.length - 1; i >= 0; i--) {
                let fontTag = fontTags[i];
                while (fontTag.firstChild) {
                    DOM.insertBefore(fontTag.firstChild, fontTag);
                }
                DOM.removeNode(fontTag);
            }
        }
    }
});

export default BaseFormatter;
