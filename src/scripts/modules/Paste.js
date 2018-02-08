// jshint strict: false

/**
 * Paste -
 * Handle paste event. Capture paste data, clean it and sanitize it in canvas
 * before importing it into the editor.
 * @access protected
 * @module modules/Paste
 */
import DOMPurify from 'dompurify';

import Module from '../core/Module';
import pasteUtils from '../utils/paste';
import DOM from '../utils/DOM';

const Paste = Module({
    name: 'Paste',
    props: {},
    handlers: {
        commands: {},
        requests: {},
        events: {
            'contenteditable:paste': 'handlePaste'
        }
    },
    methods: {
        init () {

        },

        handlePaste (evnt) {
            evnt.preventDefault();

            const { mediator } = this;
            let {
                'text/html': pastedHTML,
                'text/plain': pastedPlain
            } = this.getClipboardContent(evnt, window, document);

            if (!pastedHTML) {
                pastedHTML = pastedPlain.replace(/(?:\r\n|\r|\n)/g, '<br />');
            }

            pastedHTML = this.cleanPastedHTML(pastedHTML);
            pastedHTML = DOMPurify.sanitize(pastedHTML);

            mediator.exec('contenteditable:inserthtml', pastedHTML);
        },

        getClipboardContent (evnt, contextWindow, contextDocument) {
            const dataTransfer = evnt.clipboardData || contextWindow.clipboardData || contextDocument.dataTransfer;
            let data = {
                pastedHTML: '',
                pastedPlain: ''
            };

            if (!dataTransfer) {
                return data;
            }

            if (dataTransfer.getData) {
                let legacyText = dataTransfer.getData('text');
                if (legacyText && legacyText.length > 0) {
                    data['text/plain'] = legacyText;
                }
            }

            if (dataTransfer.types) {
                for (let i = 0; i < dataTransfer.types.length; i++) {
                    let contentType = dataTransfer.types[i];
                    data[contentType] = dataTransfer.getData(contentType);
                }
            }

            return data;
        },

        cleanPastedHTML (pastedHTML) {
            const { mediator } = this;
            const canvasDoc = mediator.get('canvas:document');
            const canvasBody = mediator.get('canvas:body');
            const replacements = pasteUtils.createReplacements();

            for (let i = 0; i < replacements.length; i++) {
                let replacement = replacements[i];
                pastedHTML = pastedHTML.replace(replacement[0], replacement[1]);
            }

            canvasBody.innerHTML = '<p>' + pastedHTML.split('<br><br>').join('</p><p>') + '</p>';

            let elList = canvasBody.querySelectorAll('a,p,div,br');
            for (let i = 0; i < elList.length; i++) {
                let workEl = elList[i];

                workEl.innerHTML = workEl.innerHTML.replace(/\n/gi, ' ');
            }

            const pasteBlock = canvasDoc.createDocumentFragment();
            const pasteBlockBody = canvasDoc.createElement('body');
            pasteBlock.appendChild(pasteBlockBody);
            pasteBlockBody.innerHTML = canvasBody.innerHTML;

            this.cleanupSpans(pasteBlockBody);
            this.cleanupDivs(pasteBlockBody);

            elList = pasteBlockBody.querySelectorAll('*');
            for (let i = 0; i < elList.length; i++) {
                let workEl = elList[i];
                let elAttrs = [];

                for (let j = 0; j < workEl.attributes.length; j++) {
                    elAttrs.push(workEl.attributes[j].name);
                }

                for (let k = 0; k < elAttrs.length; k++) {
                    let attrName = elAttrs[k];
                    if (!(workEl.nodeName === 'A' && attrName === 'href')) {
                        workEl.removeAttribute(attrName);
                    }
                }
            }

            canvasBody.innerHTML = pasteBlockBody.innerHTML;
            mediator.exec('format:list:cleanup', canvasBody);
            mediator.exec('format:clean', canvasBody);

            pastedHTML = canvasBody.innerHTML;
            return pastedHTML;
        },

        cleanupSpans (containerEl) {
            let spans = containerEl.querySelectorAll('.replace-with');

            for (let i = 0; i < spans.length; i++) {
                let span = spans[i];
                let replaceBold = span.classList.contains('bold');
                let replaceItalic = span.classList.contains('italic');
                let replacement = document.createElement(replaceBold ? 'b' : 'i');

                if (replaceBold && replaceItalic) {
                    replacement.innerHTML = '<i>' + span.innerHTML + '</i>';
                } else {
                    replacement.innerHTML = span.innerHTML;
                }

                span.parentNode.replaceChild(replacement, span);
            }

            spans = containerEl.querySelectorAll('span');
            for (let i = 0; i < spans.length; i++) {
                let span = spans[i];
                DOM.unwrap(span);
            }
        },

        cleanupDivs (containerEl) {
            let divs = containerEl.querySelectorAll('div');
            for (let i = divs.length - 1; i >=0; i--) {
                DOM.unwrap(divs[i]);
            }
        }
    }
});

export default Paste;
