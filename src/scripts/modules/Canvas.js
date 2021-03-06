// jshint strict: false

/**
 * Canvas -
 * Provides a canvas and inteface methods to allow for manipulation of the content
 * in a sandbox to avoid contaminating the current editor and the undo/redo history
 *
 * @access protected
 * @module modules/Canvas
 *
 * @example
 * // Available requests and commands
 * requests: {
 *     'canvas:document' : 'getCanvasDocument',
 *     'canvas:window' : 'getCanvasWindow',
 *     'canvas:body' : 'getCanvasBody',
 *     'canvas:selection:coordinates' : 'getSelectionCoordinates',
 *     'canvas:selection': 'getSelection',
 * },
 * commands: {
 *     'canvas:content' : 'setContent',
 *     'canvas:select:by:coordinates' : 'selectByCoordinates',
 *     'canvas:export:all': 'exportAll',
 *     'canvas:cache:selection': 'cacheSelection',
 *     'canvas:select:cachedSelection': 'selectCachedSelection',
 *     'canvas:select:ensure:offsets': 'ensureSelectionOffsets'
 * },
 */
import Module from '../core/Module';
import DOM from '../utils/DOM';
import zeroWidthSpace from '../utils/zeroWidthSpace';

import canvasStyles from '../../styles/canvas.scss';

/**
* @access protected
*/
const Canvas = Module({
    name: 'Canvas',
    props: {
        iframe: null,
        relativeRange: null,
        alreadyContainered: false,
        cachedSelection: null
    },
    handlers: {
        requests: {
            'canvas:document' : 'getCanvasDocument',
            'canvas:window' : 'getCanvasWindow',
            'canvas:body' : 'getCanvasBody',
            'canvas:selection:coordinates' : 'getSelectionCoordinates',
            'canvas:selection': 'getSelection'
        },
        commands: {
            'canvas:content' : 'setContent',
            'canvas:select:by:coordinates' : 'selectByCoordinates',
            'canvas:export:all': 'exportAll',
            'canvas:cache:selection': 'cacheSelection',
            'canvas:select:cachedSelection': 'selectCachedSelection',
            'canvas:select:ensure:offsets': 'ensureSelectionOffsets'
        },
        events: {
            'app:destroy' : 'destroy'
        }
    },
    methods: {
        init () {
            this.appendStyles();
            this.createIframe();
        },

        appendStyles () {
            const { props } = this;
            props.styles = DOM.addStyles(canvasStyles);
        },

        createIframe () {
            const { mediator } = this;
            const iframe = document.createElement('iframe');

            iframe.classList.add('typester-canvas');
            iframe.onload = () => {
                this.setCanvasBodyEditable();
                this.applyPolyfills();
                mediator.emit('canvas:created');
            };

            this.props.iframe = iframe;
            document.body.appendChild(iframe);
        },

        clearIframe () {
            const canvasBody = this.getCanvasBody();
            canvasBody.innerHTML = '';
        },

        reset () {
            const { props } = this;
            props.relativeRange = null;
            props.alreadyContainered = false;
            props.cachedSelection = null;
            this.clearIframe();
        },

        cacheSelection () {
            const { props, mediator } = this;

            mediator.exec('selection:ensure:text:only');

            const {
                anchorNode,
                anchorOffset,
                focusNode,
                focusOffset
            } = mediator.get('selection:current');

            props.cachedSelection = {
                anchorNode,
                anchorOffset,
                focusNode,
                focusOffset
            };
        },

        selectCachedSelection () {
            const { props, mediator } = this;

            const {
                anchorNode,
                anchorOffset,
                focusNode,
                focusOffset
            } = props.cachedSelection;

            const canvasDoc = this.getCanvasDocument();
            const newRange = canvasDoc.createRange();

            newRange.setStart(anchorNode, anchorOffset);
            newRange.setEnd(focusNode, focusOffset);

            mediator.exec('selection:update:range', newRange);
        },

        ensureSelectionOffsets () {
            const { props, mediator } = this;

            if (!props.cachedSelection) {
                return;
            }

            const {
                anchorNode: currentAnchorNode,
                anchorOffset: currentAnchorOffset,
                focusNode: currentFocusNode,
                focusOffset: currentFocusOffset
            } = mediator.get('selection:current');

            const {
                anchorOffset: cachedAnchorOffset,
                focusOffset: cachedFocusOffset
            } = props.cachedSelection;

            const anchorOffsetMismatch = currentAnchorOffset !== cachedAnchorOffset;
            const focusOffsetMismatch = currentFocusOffset !== cachedFocusOffset;

            if (anchorOffsetMismatch || focusOffsetMismatch) {
                const canvasDoc = this.getCanvasDocument();
                const newRange = canvasDoc.createRange();

                newRange.setStart(currentAnchorNode, cachedAnchorOffset);
                newRange.setEnd(currentFocusNode, cachedFocusOffset);

                mediator.exec('selection:update:range', newRange);
            }
        },

        setCanvasBodyEditable () {
            const { props } = this;
            const canvasBody = props.iframe.contentDocument.body;
            canvasBody.contentEditable = true;
        },

        applyPolyfills () {
            const canvasWindow = this.getCanvasWindow();
            if (canvasWindow.NodeList && !canvasWindow.NodeList.prototype.forEach) {
                canvasWindow.NodeList.prototype.forEach = function (callback, thisArg) {
                    thisArg = thisArg || canvasWindow;
                    for (var i = 0; i < this.length; i++) {
                        callback.call(thisArg, this[i], i, this);
                    }
                };
            }
        },

        // Handlers
        getCanvasDocument () {
            const { props } = this;
            return props.iframe.contentDocument;
        },

        getCanvasWindow () {
            const { props } = this;
            return props.iframe.contentWindow;
        },

        getCanvasBody () {
            const { props } = this;
            return props.iframe.contentDocument.body;
        },

        setContent (html) {
            const canvasDoc = this.getCanvasDocument();

            if (html instanceof Array) {
                this.reset();
                html.forEach((node) => {
                    canvasDoc.body.appendChild(node);
                });
            } else {
                canvasDoc.body.innerHTML = html;
            }
        },

        insertRange (range) {
            const rangeDocFrag = range.cloneContents();
            const canvasBody = this.getCanvasBody();

            this.reset();

            for (let i = 0; i < rangeDocFrag.childNodes.length; i++) {
                let childNode = rangeDocFrag.childNodes[i];
                if (
                    childNode.nodeType === Node.TEXT_NODE &&
                    (
                        !/\w+/.test(childNode.textContent) ||
                        zeroWidthSpace.assert(childNode)
                    )
                ) {
                    rangeDocFrag.removeChild(childNode);
                }
            }

            canvasBody.appendChild(rangeDocFrag);
        },

        selectAll (opts={}) {
            const { mediator } = this;
            mediator.exec('selection:select:all', opts);
        },

        selectByCoordinates (rangeCoordinates) {
            const { mediator } = this;
            const canvasBody = this.getCanvasBody();

            mediator.exec('selection:set:el', canvasBody);
            mediator.exec('selection:select:coordinates', rangeCoordinates);
        },

        exportAll () {
            const { mediator } = this;
            const canvasBody = this.getCanvasBody();
            const clonedNodes = DOM.cloneNodes(canvasBody, { trim: true });
            const exportHTMLString = DOM.nodesToHTMLString(clonedNodes);

            mediator.exec('contenteditable:inserthtml', exportHTMLString);
        },

        cleanHtml () {
            const canvasDoc = this.getCanvasDocument();
            const canvasBody = this.getCanvasBody();
            const walker = canvasDoc.createTreeWalker(canvasBody, NodeFilter.SHOW_ALL, null, false);

            let allNodes = [];

            while (walker.nextNode()) {
                allNodes.push(walker.currentNode);
            }

            for (let i = allNodes.length - 1; i >= 0; i--) {
                let node = allNodes[i];

                if (
                    !node.textContent ||
                    !node.textContent.trim().length ||
                    (zeroWidthSpace.assert(node))
                ) {
                    DOM.removeNode(node);
                } else if (
                    node.classList && node.classList.contains('typester-replace-default')
                ) {
                    let defaultNode = document.createElement('p');
                    DOM.insertAfter(defaultNode, node);
                    defaultNode.appendChild(node);
                    DOM.unwrap(node);
                }

                if (
                    (node.classList && node.classList.contains('typester-container')) ||
                    (node.nodeName === 'SPAN' && node.hasAttribute('style')) ||
                    node.nodeName === 'FONT' || node.nodeName === 'DIV'
                ) {
                    DOM.unwrap(node);
                }
            }
        },

        getSelection () {
            const { mediator } = this;
            return mediator.get('selection:current');
        },

        getSelectionCoordinates () {
            const { mediator } = this;
            return mediator.get('selection:range:coordinates');
        },

        destroy () {
            const { props } = this;
            const { iframe } = props;
            iframe.parentNode.removeChild(iframe);
        }
    }
});

export default Canvas;
