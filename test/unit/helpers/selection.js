// jshint strict: false
import mockEvents from './mockEvents';

const selectionHelper = {
    selectAll (elem) {
        const contextDocument = elem.ownerDocument;
        const range = contextDocument.createRange();

        range.selectNodeContents(elem);

        selectionHelper.setSelectionRange(range);
    },

    selectTextPortion (textNode, start, end) {
        const contextDocument = textNode.ownerDocument;
        const range = contextDocument.createRange();

        range.setStart(textNode, start);
        range.setEnd(textNode, end);

        selectionHelper.setSelectionRange(range);
    },

    selectFromTo (startNode, startOffset, endNode, endOffset) {
        const contextDocument = startNode.ownerDocument;
        const range = contextDocument.createRange();

        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);

        selectionHelper.setSelectionRange(range);
    },

    selectFirstAndLastTextNodes (rootElem) {
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
        const firstTextNode = textNodes.shift();
        const lastTextNode = textNodes.length ? textNodes.pop() : firstTextNode;

        selectionHelper.selectFromTo(firstTextNode, 0, lastTextNode, lastTextNode.textContent.length);
    },

    getCurrent (contextDocument=document) {
        return contextDocument.getSelection();
    },

    setSelectionRange (range) {
        const contextDocument = range.startContainer.ownerDocument;
        const contextWindow = contextDocument.defaultView || contextDocument.parentWindow;
        const windowSelection = contextWindow.getSelection();

        windowSelection.removeAllRanges();
        windowSelection.addRange(range);

        mockEvents.emit(contextDocument, 'selectionchange');
    },

    getSelectionRange () {
        return selectionHelper.getCurrent().getRangeAt(0);
    },

    selectNone (contextDocument=document) {
        const currentSelection = contextDocument.getSelection();
        currentSelection.removeAllRanges();
        mockEvents.emit(contextDocument, 'selectionchange');
    }
};

export default selectionHelper;
