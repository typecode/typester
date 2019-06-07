// jshint strict: false
/* eslint-disable no-alert, no-console */

/**
 * DOM -
 * namespaced collection of utility methods for working with the DOM.
 * @access protected
 */

const DOM = {
    regex: {
        getById: /^#/,
        getByClassName: /^\./,
        getByTag: /^[a-z]/
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
        const checkType = /^\[/.test(selector)
            ? 'attribute'
            : /^\./.test(selector)
                ? 'class'
                : /^#/.test(selector)
                    ? 'id'
                    : 'tag';

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

    closestElement(node) {
        let returnNode = node;

        while (returnNode && returnNode.nodeType !== 1) {
            returnNode = returnNode.parentNode;
        }

        return returnNode;
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
        return node.parentNode && node === node.parentNode.lastChild;
    },

    isFirstChild (node) {
        return node.parentNode && node === node.parentNode.firstChild;
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

    removeNode (node) {
        const parentNode = node.parentElement || node.parentNode;
        if (parentNode) {
            parentNode.removeChild(node);
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

    getRootEl() {
        const selection = document.getSelection();
        const anchorNode = selection.anchorNode;

        let rootEl = anchorNode;
        while (rootEl && !(rootEl.nodeType === Node.ELEMENT_NODE && rootEl.hasAttribute('contenteditable'))) {
            rootEl = rootEl.parentNode;
        }

        return rootEl;
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
            const trimmableSides = DOM.trimmableSides(node);
            let trimmedText = node.textContent.replace(/\s{2,}/g, ' ').replace(/\r?\n|\r/g, '');

            if (trimmableSides.left) {
                trimmedText = trimmedText.replace(/^\s+?/, '');
            }
            if (trimmableSides.right) {
                trimmedText = trimmedText.replace(/\s+?$/, '');
            }

            node.textContent = trimmedText;
        } else {
            node.childNodes.forEach((childNode) => {
                DOM.trimNodeText(childNode);
            });
        }
    },

    trimmableSides (node) {
        const isInline = DOM.nodeIsInline(node);
        const isFirstChild = DOM.isFirstChild(node);
        const isLastChild = DOM.isLastChild(node);

        return {
            left: !isInline && isFirstChild,
            right: !isInline && isLastChild
        };
    },

    nodesToHTMLString (nodes) {
        let HTMLString = '';

        nodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                if(node.textContent.match(/\w+/)) {
                    HTMLString += node.textContent;
                }
            } else {
                HTMLString += node.outerHTML;
            }
        });

        return HTMLString;
    },

    nodeIsInline (node) {
        const inlineTagNames = ['B', 'STRONG', 'I', 'U', 'S', 'SUP', 'SUB'];

        if (!node) { return false; }
        if (node.nodeType !== Node.ELEMENT_NODE) {
            node = DOM.closestElement(node);
        }
        if (!node) { return false; }

        return inlineTagNames.indexOf(node.nodeName) > -1;
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
        return selector.replace(/^[.#]/, '');
    }
};

export default DOM;
