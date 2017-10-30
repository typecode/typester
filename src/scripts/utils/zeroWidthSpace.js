// jshint strict: false

const zeroWidthSpaceEntity = '&ZeroWidthSpace;';
const zeroWidthSpace = {
    generate () {
        let tmpEl = document.createElement('span');
        tmpEl.innerHTML = zeroWidthSpaceEntity;
        return tmpEl;
    },

    get () {
        const tmpEl = zeroWidthSpace.generate();
        return tmpEl.firstChild;
    },

    assert (node) {
        const tmpEl = zeroWidthSpace.generate();
        if (node.nodeType === Node.ELEMENT_NODE) {
            return node.innerHTML === tmpEl.innerHTML;
        } else if (node.nodeType === Node.TEXT_NODE) {
            return node.nodeValue === tmpEl.firstChild.nodeValue;
        }
    }
};

export default zeroWidthSpace;
