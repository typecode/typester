const Demo = function (opts) {
    const { animation } = opts;

    const demoSectionEl = document.querySelector('section.demo');
    const editablePaneEl = demoSectionEl.querySelector('.demo-pane[contenteditable]');
    const codeEl = demoSectionEl.querySelector('.demo-pane code');

    const escapeHTML = function (htmlString) {
        return htmlString.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
    };

    const openTag = function (elem) {
        let tagString = '';

        tagString += '<span class="tag">';
        tagString += '&lt;';
        tagString += elem.tagName.toLowerCase();

        for (let i = 0; i < elem.attributes.length; i++) {
            let attribute = elem.attributes[i];
            tagString += ' ' + attribute.name + '="' + attribute.value + '"';
        }

        tagString += '&gt;';
        tagString += '</span>';

        return tagString;
    };

    const closeTag = function (elem) {
        let tagString = '';

        tagString += '<span class="tag">';
        tagString += '&lt;/';
        tagString += elem.tagName.toLowerCase();
        tagString += '&gt;';
        tagString += '</span>';

        return tagString;
    };

    const elemToCodeStr = function (elem, indent, parentIsBlock) {
        if (!elem.textContent.trim().length) { return ''; }
        let elemHTML = '';
        const { tagName } = elem;
        const isBlockTag = ['H1', 'H2', 'P', 'UL', 'OL', 'LI', 'BLOCKQUOTE'].indexOf(tagName) > -1;
        const inlineContent = ['H1', 'H2', 'UL', 'OL', 'A', 'SPAN'].indexOf(tagName) > -1;

        if (isBlockTag) {
            elemHTML += '<span class="code-line">';
        }

        if (elem.nodeType !== Node.ELEMENT_NODE) {
            elemHTML += elem.textContent.replace(/\s+/g, ' ');
        } else {
            elemHTML += openTag(elem);
            if (!inlineContent) {
                elemHTML += '<span class="code-line">';
            }
            for (let i = 0; i < elem.childNodes.length; i++) {
                elemHTML += elemToCodeStr(elem.childNodes[i], indent + 1, isBlockTag);
            }
            if (!inlineContent) {
                elemHTML += '</span>';
            }
            elemHTML += closeTag(elem);
        }

        if (isBlockTag) {
            elemHTML += '</span>';
        }
        return elemHTML;
    };

    const updateCodeDisplay = function () {
        let codeDisplayHTML = '';
        for (let i = 0; i < editablePaneEl.childNodes.length; i++) {
            codeDisplayHTML += elemToCodeStr(editablePaneEl.childNodes[i], 0);
        }
        codeEl.innerHTML = codeDisplayHTML;
    };

    const editObserver = new MutationObserver(updateCodeDisplay);
    editObserver.observe(editablePaneEl, {
        childList: true,
        characterData: true,
        attributes: true,
        subtree: true
    });
    updateCodeDisplay();
};

export default Demo;
