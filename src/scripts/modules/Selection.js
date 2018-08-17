// jshint strict: false
/**
 * Selection
 *
 * A module to handle everything that happens with the user's selection and the
 * selection range
 *
 * @access protected
 * @module modules/Selection
 *
 * @example
 * // Available requests / commands:
 *
 * requests: {
 *     'selection:current': 'getCurrentSelection',
 *     'selection:range': 'getCurrentRange',
 *     'selection:anchornode': 'getAnchorNode',
 *     'selection:rootelement': 'getRootElement',
 *     'selection:bounds': 'getSelectionBounds',
 *     'selection:in:or:contains': 'inOrContains',
 *     'selection:range:coordinates': 'rangeCoordinates',
 *     'selection:contains:node': 'containsNode',
 *     'selection:spans:multiple:blocks': 'spansMultipleBlocks'
 * },
 *
 * commands: {
 *     'selection:set:contextWindow': 'setContextWindow',
 *     'selection:set:contextDocument': 'setContextDocument',
 *     'selection:set:el': 'setRootElement',
 *     'selection:update:range': 'updateRange',
 *     'selection:wrap:element': 'wrapElement',
 *     'selection:wrap:pseudo': 'wrapPseudoSelect',
 *     'selection:select:pseudo': 'selectPseudo',
 *     'selection:select:remove:pseudo': 'removePseudo',
 *     'selection:reselect': 'reSelect',
 *     'selection:select:contents': 'selectContents',
 *     'selection:select:all': 'selectAll',
 *     'selection:select:coordinates': 'selectByCoordinates',
 *     'selection:ensure:text:only' : 'ensureTextOnlySelection',
 * }
 */

import Module from '../core/Module';
import DOM from '../utils/DOM';

/**
 * Creates a new Selection handler
 * @constructor Selection
 */
const Selection = Module({
    name: 'Selection',
    props: {
        contextWindow: window,
        contextDocument: document,
        cachedSelection: null,
        cachedRange: null,
        pseudoSelection: null,
        silenceChanges: []
    },
    dom: {
        el: null
    },
    handlers: {
        requests: {
            'selection:current': 'getCurrentSelection',
            'selection:range': 'getCurrentRange',
            'selection:anchornode': 'getAnchorNode',
            'selection:rootelement': 'getRootElement',
            'selection:bounds': 'getSelectionBounds',
            'selection:in:or:contains': 'inOrContains',
            'selection:range:coordinates': 'rangeCoordinates',
            'selection:contains:node': 'containsNode',
            'selection:spans:multiple:blocks': 'spansMultipleBlocks'
        },

        commands: {
            'selection:set:contextWindow': 'setContextWindow',
            'selection:set:contextDocument': 'setContextDocument',
            'selection:set:el': 'setRootElement',
            'selection:update:range': 'updateRange',
            'selection:wrap:element': 'wrapElement',
            'selection:wrap:pseudo': 'wrapPseudoSelect',
            'selection:select:pseudo': 'selectPseudo',
            'selection:select:remove:pseudo': 'removePseudo',
            'selection:reselect': 'reSelect',
            'selection:select:contents': 'selectContents',
            'selection:select:all': 'selectAll',
            'selection:select:coordinates': 'selectByCoordinates',
            'selection:ensure:text:only' : 'ensureTextOnlySelection'
        }
    },
    methods: {
        init () {
            this.bindDocumentEvents();
        },

        bindDocumentEvents () {
            const { contextDocument } = this.props;
            contextDocument.addEventListener('selectstart', this.handleSelectStart);
            contextDocument.addEventListener('selectionchange', this.handleSelectionChange);
        },

        unbindDocumentEvents () {
            const { contextDocument } = this.props;
            contextDocument.removeEventListener('selectstart', this.handleSelectStart);
            contextDocument.removeEventListener('selectionchange', this.handleSelectionChange);
        },

        setContextWindow (contextWindow) {
            const { props } = this;
            props.contextWindow = contextWindow;
        },

        setContextDocument (contextDocument) {
            const { props } = this;
            this.unbindDocumentEvents();
            props.contextDocument = contextDocument;
            this.bindDocumentEvents();
        },

        setRootElement (elem) {
            const { dom } = this;
            dom.el = [elem];
        },

        handleSelectStart (evnt) {
            const { mediator } = this;
            const { el } = this.dom;
            const anchorNode = this.getAnchorNode();

            if (DOM.isChildOf(anchorNode, el)) {
                mediator.emit('selection:start', evnt);
            }
        },

        handleSelectionChange (evnt) {
            const { mediator, props } = this;
            const { el } = this.dom;
            const anchorNode = this.getAnchorNode();

            if (DOM.isChildOf(anchorNode, el)) {
                this.cacheRange();
                if (!props.silenceChanges.length) {
                    mediator.emit('selection:change', evnt);
                } else {
                    props.silenceChanges.pop();
                }
            }
        },

        cacheRange () {
            const currentRange = this.getCurrentRange();
            this.props.cachedRange = currentRange.cloneRange();
        },

        getCurrentSelection () {
            const { contextWindow } = this.props;
            return contextWindow.getSelection();
        },

        validateSelection (selection) {
            const { dom } = this;
            return selection.anchorNode && DOM.isChildOf(selection.anchorNode, dom.el);
        },

        getCurrentRange () {
            const { props } = this;
            const currentSelection = this.getCurrentSelection();
            let currentRange;

            if (this.validateSelection(currentSelection)) {
                currentRange = currentSelection.getRangeAt(0);
            } else if (props.cachedRange) {
                currentRange = props.cachedRange;
            } else {
                currentRange = document.createRange();
            }

            return currentRange;
        },

        getAnchorNode () {
            const currentSelection = this.getCurrentSelection();
            return currentSelection && currentSelection.anchorNode;
        },

        getRootElement () {
            const { dom } = this;
            return dom.el[0];
        },

        rangeCoordinates () {
            this.ensureTextOnlySelection();

            let {
                startContainer,
                startOffset,
                endContainer,
                endOffset
            } = this.getCurrentRange();

            let startCoordinates = [];
            let endCoordinates = [];
            let startPrefixTrimLength = 0;
            let endPrefixTrimLength = 0;
            let endSuffixTrimLength = 0;

            const startTrimmablePrefix = startContainer.textContent.match(/^(\r?\n|\r)?(\s+)?/);
            const endTrimmablePrefix = endContainer.textContent.match(/^(\r?\n|\r)?(\s+)?/);
            const endTrimmableSuffix = endContainer.textContent.match(/(\r?\n|\r)?(\s+)?$/);
            const startTrimmableSides = DOM.trimmableSides(startContainer.firstChild ? startContainer.firstChild : startContainer);
            const endTrimmableSides = DOM.trimmableSides(endContainer.lastChild ? endContainer.lastChild : endContainer);

            if (startTrimmablePrefix && startTrimmablePrefix[0].length) {
                startPrefixTrimLength += startTrimmablePrefix[0].length;
                if (!startTrimmableSides.left) {
                    startPrefixTrimLength -= startTrimmablePrefix[0].match(/\s/) ? 1 : 0;
                }
                startOffset -= startPrefixTrimLength;
                if (endContainer === startContainer) {
                    endOffset -= startPrefixTrimLength;
                }
            }

            if (endTrimmablePrefix && endTrimmablePrefix[0].length && endContainer !== startContainer) {
                endPrefixTrimLength += endTrimmablePrefix[0].length;
                if (!endTrimmableSides.left) {
                    endPrefixTrimLength -= endTrimmablePrefix[0].match(/\s/) ? 1 : 0;
                }
                endOffset -= endPrefixTrimLength;
            }

            if (endTrimmableSuffix && endTrimmableSuffix[0].length) {
                endSuffixTrimLength += endTrimmableSuffix[0].length;
                if (!endTrimmableSides.right) {
                    endSuffixTrimLength -= endTrimmableSuffix[0].match(/\s/) ? 1 : 0;
                }
                let trimmedTextLength = endContainer.textContent.length - endPrefixTrimLength - endSuffixTrimLength;
                endOffset = Math.min(trimmedTextLength, endOffset);
            }

            startOffset = Math.max(0, startOffset);
            endOffset = Math.min(endContainer.textContent.length, endOffset);

            startCoordinates.unshift(startOffset);
            endCoordinates.unshift(endOffset);

            while (startContainer && !this.isContentEditable(startContainer)) {
                startCoordinates.unshift(DOM.childIndex(startContainer));
                startContainer = startContainer.parentNode;
            }

            while (endContainer && !this.isContentEditable(endContainer)) {
                endCoordinates.unshift(DOM.childIndex(endContainer));
                endContainer = endContainer.parentNode;
            }

            return {
                startCoordinates,
                endCoordinates
            };
        },

        inOrContains (selectors) {
            const { dom } = this;
            const rootEl = dom.el[0];
            const anchorNode = this.getAnchorNode();

            if (!rootEl.contains(anchorNode)) {
                return false;
            }

            const isIn = DOM.isIn(anchorNode, selectors, rootEl);
            if (isIn) {
                return isIn;
            }

            const currentRange = this.getCurrentRange();
            const rangeFrag = currentRange.cloneContents();
            let contains = false;

            if (rangeFrag.childNodes.length) {
                rangeFrag.childNodes.forEach(childNode => {
                    contains = contains || selectors.indexOf(childNode.nodeName) > -1;
                });
            }

            return contains;
        },

        containsNode (node) {
            const currentSelection = this.getCurrentSelection();
            let { anchorNode, focusNode } = currentSelection;
            const selectionContainsNode = currentSelection.containsNode(node, true);

            if (!currentSelection.rangeCount) {
                return false;
            }

            if (selectionContainsNode) {
                return true;
            }

            if (anchorNode.nodeType !== Node.ELEMENT_NODE) {
                anchorNode = anchorNode.parentNode;
            }

            if (focusNode.nodeType !== Node.ELEMENT_NODE) {
                focusNode = focusNode.parentNode;
            }

            return anchorNode === node || focusNode === node;
        },

        wrapElement (elem, opts={}) {
            const currentRange = this.getCurrentRange();

            if (elem instanceof Array) {
                currentRange.setStartBefore(elem[0]);
                currentRange.setEndAfter(elem[elem.length - 1]);
            } else if (elem.nodeType === Node.ELEMENT_NODE) {
                currentRange.setStartBefore(elem);
                currentRange.setEndAfter(elem);
            }

            this.updateRange(currentRange, opts);
        },

        wrapPseudoSelect () {
            const { props } = this;
            const currentRange = this.getCurrentRange();

            const pseudoSelection = document.createElement('span');
            pseudoSelection.classList.add('typester-pseudo-selection');
            pseudoSelection.appendChild(currentRange.extractContents());
            currentRange.insertNode(pseudoSelection);

            props.pseudoSelection = pseudoSelection;
            this.wrapElement(pseudoSelection);
        },

        selectPseudo () {
            const { dom } = this;
            const unwrappedNodes = this.removePseudo();

            if (unwrappedNodes.length) {
                dom.el[0].focus();
                this.wrapElement(unwrappedNodes, { silent: true });
            }
        },

        removePseudo () {
            const { props } = this;
            let unwrappedNodes = [];

            if (
                props.pseudoSelection &&
                props.pseudoSelection.tagName
            ) {
                unwrappedNodes = DOM.unwrap(props.pseudoSelection);
                props.pseudoSelection = null;
            }

            return unwrappedNodes;
        },

        selectContents (node) {
            const newRange = document.createRange();

            if (node.childNodes.length) {
                newRange.selectNodeContents(node);
            } else {
                newRange.setStart(node, 0);
                newRange.collapse(true);
            }

            this.updateRange(newRange);
        },

        updateRange (range, opts={}) {
            const { mediator, props } = this;
            const currentSelection = this.getCurrentSelection();

            if (opts.silent) {
                props.silenceChanges.push(true); // silence removeAllRanges
                props.silenceChanges.push(true); // silence addRange
            }

            currentSelection.removeAllRanges();
            currentSelection.addRange(range);

            if (!opts.silent) {
                mediator.emit('selection:update');
            }
        },

        isContentEditable (node) {
            return node && node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('contenteditable');
        },

        getSelectionBounds () {
            const currentRange = this.getCurrentRange();
            const rangeRects = currentRange ? currentRange.getClientRects() : [];

            let selectionBounds = {
                top: null,
                right: null,
                bottom: null,
                left: null,
                height: null,
                width: null,
                initialWidth: null,
                initialLeft: null
            };

            const setSelectionBoundary = function (rangeRect) {
                ['top', 'left', 'bottom', 'right', 'height', 'width'].forEach((rectKey) => {
                    if (!selectionBounds[rectKey]) {
                        selectionBounds[rectKey] = rangeRect[rectKey];
                    } else {
                        switch (rectKey) {
                        case 'top':
                        case 'left':
                            selectionBounds[rectKey] = Math.min(selectionBounds[rectKey], rangeRect[rectKey]);
                            break;
                        case 'bottom':
                        case 'right':
                        case 'height':
                        case 'width':
                            selectionBounds[rectKey] = Math.max(selectionBounds[rectKey], rangeRect[rectKey]);
                            break;
                        }
                    }
                });
            };

            const setInitialBoundary = function (rangeRect) {
                // NB: I have commented this out because it is causing inaccurate toolbar alignment.
                // I am leaving it here for now in case it was actually meant for something that I
                // can't recall right now.
                //  - Fred
                // if (rangeBoundingClientRect) {
                //     selectionBounds.initialLeft = rangeBoundingClientRect.left;
                //     selectionBounds.initialWidth = rangeBoundingClientRect.width;
                // } else
                if (rangeRect.top === selectionBounds.top) {
                    if (selectionBounds.initialLeft === null) {
                        selectionBounds.initialLeft = rangeRect.left;
                    } else {
                        selectionBounds.initialLeft = Math.min(rangeRect.left, selectionBounds.initialLeft);
                    }

                    if (selectionBounds.initialWidth === null) {
                        selectionBounds.initialWidth = rangeRect.width;
                    } else {
                        selectionBounds.initialWidth = Math.max(rangeRect.right - selectionBounds.initialLeft, selectionBounds.initialWidth);
                    }
                }
            };

            for (let i = 0; i < rangeRects.length; i++) {
                setSelectionBoundary(rangeRects[i], i);
            }

            for (let i = 0; i < rangeRects.length; i++) {
                setInitialBoundary(rangeRects[i], i);
            }

            return selectionBounds;
        },

        reSelect () {
            const { props } = this;
            if (props.cachedRange) {
                this.updateRange(props.cachedRange, { silent: true });
            }
        },

        selectAll (opts={}) {
            const { dom, props } = this;
            const { contextDocument } = props;
            const range = contextDocument.createRange();
            const rootElem = dom.el[0];

            if (opts.selector) {
                const elems = contextDocument.querySelectorAll(opts.selector);
                range.setStartBefore(elems[0]);
                range.setEndAfter(elems[elems.lenght - 1]);
            } else {
                range.setStart(rootElem, 0);
                range.setEndAfter(rootElem.lastChild);
            }

            this.updateRange(range);
        },

        selectByCoordinates (rangeCoordinates) {
            const { dom, props } = this;
            const { contextDocument } = props;
            const newRange = contextDocument.createRange();
            const startCoordinates = rangeCoordinates.startCoordinates.slice(0);
            const endCoordinates = rangeCoordinates.endCoordinates.slice(0);
            const startOffset = startCoordinates.pop();
            const endOffset = endCoordinates.pop();

            let startContainer = dom.el[0];
            let endContainer = dom.el[0];

            while (startCoordinates.length) {
                let startIndex = startCoordinates.shift();
                startContainer = startContainer.childNodes[startIndex];
            }

            while (endCoordinates.length) {
                let endIndex = endCoordinates.shift();
                endContainer = endContainer.childNodes[endIndex];
            }

            newRange.setStart(startContainer, startOffset);
            newRange.setEnd(endContainer, endOffset);

            this.updateRange(newRange);
        },

        ensureTextOnlySelection () {
            const { contextDocument } = this.props;
            const currentRange = this.getCurrentRange();
            const currentSelection = this.getCurrentSelection();
            const {
                startContainer,
                endContainer,
                commonAncestorContainer
            } = currentRange;

            if (
                currentSelection.isCollapsed ||
                (
                    startContainer.nodeType === Node.TEXT_NODE &&
                    endContainer.nodeType === Node.TEXT_NODE
                )
            ) {
                return;
            }

            const rangeString = currentRange.toString();

            let newRange = contextDocument.createRange();

            const walker = contextDocument.createTreeWalker(
                commonAncestorContainer,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let textNodes = [];
            while (walker.nextNode()) {
                textNodes.push(walker.currentNode);
            }

            const firstTextNode = textNodes[0];
            const lastTextNode = textNodes[textNodes.length - 1];

            newRange.setStart(firstTextNode, 0);
            newRange.setEnd(lastTextNode, lastTextNode.textContent.length);

            let currentNodeIndex = 0;
            let newStartOffset = 0;
            let currentTextNode = textNodes[currentNodeIndex];

            while (newRange.compareBoundaryPoints(Range.START_TO_START, currentRange) < 0) {
                newStartOffset += 1;

                if (newStartOffset > currentTextNode.textContent.length) {
                    currentNodeIndex += 1;
                    newStartOffset = 0;

                    if (currentNodeIndex >= textNodes.length) {
                        break;
                    }
                    currentTextNode = textNodes[currentNodeIndex];
                }

                newRange.setStart(currentTextNode, newStartOffset);
            }

            let newEndOffset = newStartOffset;
            newRange.setEnd(currentTextNode, newEndOffset);

            while (newRange.compareBoundaryPoints(Range.END_TO_END, currentRange) < 0) {
                newEndOffset += 1;
                if (newEndOffset > currentTextNode.textContent.length) {
                    currentNodeIndex += 1;
                    newEndOffset = 0;

                    if (currentNodeIndex >= textNodes.length) {
                        break;
                    }
                    currentTextNode = textNodes[currentNodeIndex];
                }

                newRange.setEnd(currentTextNode, newEndOffset);
            }

            if (newRange.toString() === rangeString) {
                this.updateRange(newRange, { silent: true });
            }
        }
    },

    spansMultipleBlocks () {
        const { mediator } = this;
        const {
            anchorNode,
            focusNode
        } = this.getCurrentSelection();

        const rootElem = this.getRootElement();
        const blockTagNames = mediator.get('config:toolbar:blockTags');

        const anchorBlock = DOM.getClosestInArray(anchorNode, blockTagNames, rootElem);
        const focusBlock = DOM.getClosestInArray(focusNode, blockTagNames, rootElem);

        return anchorBlock !== focusBlock;
    }
});

export default Selection;
