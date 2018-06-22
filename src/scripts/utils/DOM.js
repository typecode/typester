// jshint strict: false
/* eslint-disable no-alert, no-console */

/**
 * DOM -
 * namespaced collection of utility methods for working with the DOM.
 * @access protected
 */
import browser from './browser';

const DOM = {
    regex: {
        getById: /^#/,
        getByClassName: /^\./,
        getByTag: /^[a-z]/
    },

    getElements (elementsObj, rootEl) {
        for (let elementKey in elementsObj) {
            if (elementsObj.hasOwnProperty(elementKey) && elementKey !== 'rootEl') {
                let elementObj = elementsObj[elementKey];
                let { selector } = elementObj;

                rootEl = elementObj.rootEl || rootEl;
                rootEl = typeof rootEl === 'function' ? rootEl() : rootEl;

                elementObj.el = DOM.get(selector, rootEl);
            }
        }
    },

    // Public methods
    get(selector, domRoot = document) {
        if (DOM.isElement(selector)) {
            return [selector];
        }
        const getMethodName = DOM._getGetMethodName(selector);
        return DOM[getMethodName](selector, domRoot);
    },

    getByClassName(className, domRoot = document) {
        className = DOM._cleanSelector(className);
        return domRoot.getElementsByClassName(className);
    },

    getByTag(tag, domRoot = document) {
        tag = DOM._cleanSelector(tag);
        return domRoot.getElementsByTagName(tag);
    },

    getById(id) {
        return document.getElementById(id);
    },

    getClosest(node, selector, ceilNode) {
        const rootEl = ceilNode || DOM.getRootEl();
        const checkType = /^\[/.test(selector) ? 'attribute' :
                          /^\./.test(selector) ? 'class' :
                          /^\#/.test(selector) ? 'id' :
                          'tag';

        let returnNode = false;
        let attrName, className, idStr, parentId;

        if (node === rootEl) {
            return null;
        }

        while (node && node.nodeType !== Node.ELEMENT_NODE) {
            node = node.parentNode;
        }

        if (!node) {
            return null;
        }

        switch (checkType) {
        case 'attribute':
            attrName = selector.match(/\[(.*?)\]/)[1];
            returnNode = node.hasAttribute(attrName);
            break;
        case 'class':
            className = selector.replace('.', '');
            returnNode = node.classList && node.classList.contains(className);
            break;
        case 'id':
            idStr = selector.replace('#', '');
            parentId = node.getAttribute('id');
            returnNode = idStr === parentId;
            break;
        case 'tag':
            returnNode = node.nodeName.toLowerCase() === selector.toLowerCase();
            break;
        }

        if (returnNode) {
            return node;
        } else {
            return DOM.getClosest(node.parentNode, selector, rootEl);
        }
    },

    getClosestInArray (node, nameArray, ceilNode) {
        let parentNode = node;

        while (nameArray.indexOf(parentNode.nodeName) < 0 && parentNode !== ceilNode) {
            parentNode = parentNode.parentNode;
        }

        if (parentNode !== ceilNode) {
            return parentNode;
        } else {
            return null;
        }
    },

    getFurthest (node, selector) {
        const rootEl = DOM.getRootEl();
        let currentNode = node;
        let furthest = null;

        selector = selector instanceof Array ? selector : [selector];

        while (currentNode && currentNode !== rootEl) {
            if (selector.indexOf(currentNode.nodeName) > -1) {
                furthest = currentNode;
            }
            currentNode = currentNode.parentNode || currentNode.parentElement;
        }

        return furthest;
    },

    nextNode (node) {
        if (node.hasChildNodes()) {
            return node.firstChild;
        } else {
            while (node && !node.nextSibling) {
                node = node.parentNode;
            }
            if (!node) {
                return null;
            }
            return node.nextSibling;
        }
    },

    appendTo(selector, tag) {
        const htmlNode = DOM.isElement(tag) ? tag : document.createElement(tag);
        const targetEl = DOM.get(selector);

        for (let i = 0; i < targetEl.length; i++) {
            targetEl[i].appendChild(htmlNode);
        }

        return htmlNode;
    },

    prependTo(selector, tag) {
        const htmlNode = DOM.isElement(tag) ? tag : document.createElement(tag);
        const targetEl = DOM.get(selector)[0];
        const targetElFirstChild = targetEl.firstElementChild;

        targetEl.insertBefore(htmlNode, targetElFirstChild);

        return htmlNode;
    },

    addStyles(styles) {
        const styleEl = DOM.prependTo('head', 'style');

        styleEl.setAttribute('id', 'typester-styles');
        styleEl.setAttribute('type', 'text/css');

        if (styleEl.styleSheet) {
            styleEl.styleSheet.cssText = styles;
        } else {
            styleEl.appendChild(document.createTextNode(styles));
        }

        return styleEl;
    },

    // From http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    isNode(o) {
        return (
            typeof Node === 'object' ? o instanceof Node :
            o && typeof o === 'object' && typeof o.nodeType === 'number' && typeof o.nodeName === 'string'
        );
    },

    isElement(elem) {
        let isElement = false;

        isElement = elem instanceof Window || elem instanceof Document;
        isElement = isElement || typeof HTMLElement === 'object' && elem instanceof HTMLElement;
        isElement = isElement || elem && typeof elem === 'object' && elem !== null && elem.nodeType === 1 && typeof elem.nodeName === 'string';

        return isElement;
    },

    isIn(node, nodeName, ceilNode) {
        let isIn = false;
        let currentNode = node;
        let nameArray = nodeName instanceof Array ? nodeName : nodeName.split('/');

        ceilNode = ceilNode || DOM.getRootEl();
        nameArray = nameArray.map((name) => {
            return name.toLowerCase();
        });

        while (!isIn && currentNode !== ceilNode) {
            isIn = nameArray.indexOf(currentNode.nodeName.toLowerCase()) > -1;
            currentNode = currentNode.parentNode;
        }

        return isIn;
    },

    isChildOf(childNode, parentNode) {
        if (childNode instanceof Array) {
            childNode = childNode[0];
        }

        if (parentNode instanceof Array) {
            parentNode = parentNode[0];
        }

        return parentNode && childNode && parentNode.contains(childNode);
    },

    addClass(el, classStr) {
        el.classList.add(classStr);
    },

    toggleClass(el, classStr, force) {
        let addClass = force !== undefined ? force : !el.classList.contains(classStr);

        if (addClass) {
            DOM.addClass(el, classStr);
        } else {
            DOM.removeClass(el, classStr);
        }
    },

    removeClass(el, classStr) {
        el.classList.remove(classStr);
    },

    isBlock(node) {
        return DOM.getStyle(node, 'display') === 'block';
    },

    closestElement(node) {
        let returnNode = node;

        while (returnNode.nodeType !== 1) {
            returnNode = returnNode.parentNode;
        }

        return returnNode;
    },

    getStyles(node) {
        const closestElement = DOM.closestElement(node);
        const gcs = 'getComputedStyle' in window;
        return (gcs ? window.getComputedStyle(closestElement) : closestElement.currentStyle);
    },

    getStyle(node, property) {
        const nodeStyles = DOM.getStyles(node);
        return nodeStyles[property];
    },

    insertBefore (newNode, referenceNode) {
        const parentNode = referenceNode.parentNode;
        parentNode.insertBefore(newNode, referenceNode);
    },

    insertAfter(newNode, referenceNode) {
        const parentNode = referenceNode.parentNode;

        if (parentNode.lastChild === referenceNode) {
            parentNode.appendChild(newNode);
        } else {
            parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }
    },

    isLastChild (node) {
        return node === node.parentNode.lastChild;
    },

    isFirstChild (node) {
        return node === node.parentNode.firstChild;
    },

    wrapRange (nodeName, nodeOpts) {
        const sel = window.getSelection();
        const range = sel.getRangeAt(0);
        const wrapper = document.createElement(nodeName);

        for (let optKey in nodeOpts) {
            if (nodeOpts.hasOwnProperty(optKey)) {
                wrapper[optKey] = nodeOpts[optKey];
            }
        }

        range.surroundContents(wrapper);

        return wrapper;
    },

    unwrap(node, opts={}) {
        const unwrappedNodes = [];

        if (node.childNodes) {
            while (node.firstChild) {
                unwrappedNodes.push(node.firstChild);
                DOM.insertBefore(node.firstChild, node);
            }
        }

        if (!opts.keepNode) {
            DOM.removeNode(node);
        }
        return unwrappedNodes;
    },

    unwrapFrom (node, wrappers) {
        const rootEl = DOM.getRootEl();
        let currentNode = node;
        let unwrappedNodes = [currentNode];

        while (currentNode !== rootEl) {
            let parentNode = currentNode.parentNode || currentNode.parentElement;

            if (wrappers.indexOf(currentNode.nodeName) > -1) {
                unwrappedNodes = DOM.unwrap(currentNode);
            }

            currentNode = parentNode;
        }

        return unwrappedNodes;
    },

    unwrapToRoot (node) {
        const rootEl = DOM.getRootEl();
        let currentNode = node.parentNode;

        while (currentNode !== rootEl) {
            let parentNode = currentNode.parentNode;
            DOM.unwrap(currentNode);
            currentNode = parentNode;
        }
    },

    removeNode (node) {
        const parentNode = node.parentElement || node.parentNode;
        if (parentNode) {
            parentNode.removeChild(node);
        }
    },

    replaceNode (node, newNode) {
        const parentNode = node.parentNode || node.parentElement;
        if (parentNode) {
            parentNode.replaceChild(newNode, node);
        }
    },

    getContainerZIndex (node) {
        let container = node;
        let topMostContainerZIndex = 0;

        while (container && container !== document.body) {
            let containerZIndex = window.getComputedStyle(container).zIndex;
            if (/^[0-9]+$/.test(containerZIndex)) {
                topMostContainerZIndex = parseInt(containerZIndex);
            }
            container = container.parentNode;
        }

        return topMostContainerZIndex;
    },

    // // From http://stackoverflow.com/questions/6139107/programmatically-select-text-in-a-contenteditable-html-element
    // selectNodeContents(node) {
    //     node = node || DOM.getAnchorNode();
    //     if (!node) {
    //         return;
    //     }
    //
    //     const nodes = node instanceof Array ? node : [node];
    //     const startNode = nodes[0];
    //     const endNode = nodes[nodes.length - 1];
    //
    //     const range = document.createRange();
    //     range.setStart(startNode, 0);
    //     range.setEnd(endNode, endNode.length);
    //
    //     const sel = window.getSelection();
    //     if (sel.rangeCount > 0) {
    //         sel.removeAllRanges();
    //     }
    //     sel.addRange(range);
    // },

    getRootEl() {
        const selection = document.getSelection();
        const anchorNode = selection.anchorNode;

        let rootEl = anchorNode;
        while (rootEl && !(rootEl.nodeType === Node.ELEMENT_NODE && rootEl.hasAttribute('contenteditable'))) {
            rootEl = rootEl.parentNode;
        }

        return rootEl;
    },

    removeInvalidTagsUpward (node, acceptedTags) {
        const rootEl = DOM.getRootEl();
        let currentNode = node;
        let invalidTags = [];
        let unwrappedNodes = [node];

        while (currentNode !== rootEl) {
            if (currentNode.nodeType === 1 && acceptedTags.indexOf(currentNode.nodeName) < 0) {
                invalidTags.push(currentNode);
            }
            currentNode = currentNode.parentNode || currentNode.parentElement;
        }

        for (let i = 0; i < invalidTags.length; i++) {
            let invalidTag = invalidTags[i];
            unwrappedNodes = DOM.unwrap(invalidTag);
        }

        return unwrappedNodes;
    },

    // From: http://stackoverflow.com/questions/37025488/remove-whitespace-from-window-selection-in-js
    trimSelection (opts) {
        opts = opts || { fromEnd: true };

        const sel = window.getSelection();
        const range = sel.getRangeAt(0);
        const selStr = sel.toString();

        let regEx, container, method, regExResult,
            offset = range.startOffset, rangeClone;

        if (opts.bothEnds) {
            opts.fromEnd = true;
        }

        if (opts.fromEnd) {
            regEx = /\s+$/;
            container = range.endContainer;
            method = range.setEnd;
        } else if (opts.fromStart) {
            regEx = /[^\s]/;
            container = range.startContainer;
            method = range.setStart;
        }


        regExResult = regEx.exec(selStr);
        if (regExResult && regExResult.index > 0) {
            if (opts.fromEnd && offset + regExResult.index > container.length) {
                regExResult = regEx.exec(container.textContent);
                if (regExResult) {
                    method.call(range, container, regExResult.index);
                }
            } else {
                method.call(range, container, offset + regExResult.index);
            }

            rangeClone = range.cloneRange();
            sel.removeAllRanges();
            sel.addRange(rangeClone);
        }

        if (opts.bothEnds) {
            if (opts.fromEnd) {
                DOM.trimSelection({ fromStart: true });
            } else {
                DOM.trimSelection({ fromEnd: true });
            }
        }
    },

    createPseudoSelect () {
        const rootEl = DOM.getRootEl();
        const wrapper = DOM.wrapRange('SPAN', {
            className: 'pseudo-selection'
        });
        let selectionStyles;

        if (browser.isFirefox()) {
            selectionStyles = window.getComputedStyle(rootEl, '::-moz-selection');
        } else {
            selectionStyles = window.getComputedStyle(rootEl, '::selection');
        }

        wrapper.style['background-color'] = selectionStyles['background-color'];
        if (wrapper.style['background-color'] === 'transparent') {
            wrapper.style['background-color'] = '#EEEEEE';
        }
        wrapper.style.color = selectionStyles.color;

        return wrapper;
    },

    // From: https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
    getScrollOffset () {
        const supportPageOffset = window.pageXOffset !== undefined;
        const isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');

        const x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
        const y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

        return {x, y};
    },

    childIndex (node) {
        let child = node;
        let childIndex = 0;

        while ((child = child.previousSibling) !== null) {
            childIndex++;
        }

        return childIndex;
    },

    cloneNodes (rootElem, opts={}) {
        let clonedNodes = [];

        rootElem.childNodes.forEach((node) => {
            clonedNodes.push(node.cloneNode(true));
        });

        if (opts.trim) {
            clonedNodes.forEach((node) => {
                DOM.trimNodeText(node);
            });
        }

        return clonedNodes;
    },

    trimNodeText (node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const trimmedText = node.textContent
                                    .replace(/\s{2,}/g, ' ')
                                    .replace(/\r?\n|\r/g, '')
                                    .trim();
            node.textContent = trimmedText;
        } else {
            node.childNodes.forEach((childNode) => {
                DOM.trimNodeText(childNode);
            });
        }
    },

    nodesToHTMLString (nodes) {
        let HTMLString = '';

        nodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                HTMLString += node.textContent;
            } else {
                HTMLString += node.outerHTML;
            }
        });

        return HTMLString;
    },

    //Pseudo-private methods
    _getGetMethodName(selector) {
        let methodName = null;

        Object.keys(DOM.regex).forEach((regexKey) => {
            const regex = DOM.regex[regexKey];
            if (regex.test(selector)) {
                methodName = regexKey;
            }
        });

        return methodName;
    },

    _cleanSelector(selector) {
        return selector.replace(/^[\.#]/, '');
    },

    _createEl(tag) {
        return document.createElement(tag);
    }
};

export default DOM;
