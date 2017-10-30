// jshint strict: false

import Module from '../core/Module';
import DOM from '../utils/DOM';
import keycodes from '../utils/keycodes';

import contentEditableStyles from '../../styles/contentEditable.scss';

const ContentEditable = Module({
    name: 'ContentEditable',
    props: {
        styles: null,
        cleanupTimeout: null
    },
    dom: {},
    handlers: {
        requests: {
            'contenteditable:element': 'getContentEditableElement',
            'contenteditable:toolbar:buttons': 'getToolbarButtons'
        },
        commands: {
            'contenteditable:inserthtml' : 'insertHTML',
            'contenteditable:refocus' : 'reFocus',
            'contenteditable:cleanup' : 'cleanup'
        },
        domEvents: {
            'focus' : 'handleFocus',
            'keydown' : 'handleKeydown',
            'keyup' : 'handleKeyup',
            'blur' : 'handleBlur',
            'paste' : 'handlePaste',
            'mouseover' : 'handleMouseOver',
            'mouseout' : 'handleMouseOut',
            'click' : 'handleClick',
            'input' : 'handleInput'
        }
    },
    methods: {
        setup () {
            this.appendStyles();
        },

        init () {
            this.ensureClass();
            this.ensureEditable();
            this.updatePlaceholderState();
            this.updateValue();
        },

        appendStyles () {
            const { props } = this;
            props.styles = DOM.addStyles(contentEditableStyles);
        },

        ensureClass () {
            const { dom } = this;
            dom.el[0].classList.add('typester-content-editable');
        },

        updatePlaceholderState () {
            const { dom } = this;
            const rootEl = dom.el[0];

            if (rootEl.hasAttribute('data-placeholder')) {
                if (
                    (rootEl.childNodes.length && rootEl.textContent.trim().length)
                ) {
                    rootEl.classList.remove('show-placeholder');
                } else {
                    rootEl.classList.add('show-placeholder');
                }
            }
        },

        updateValue () {
            const { dom } = this;
            const rootEl = dom.el[0];

            if (rootEl.innerText.trim().length) {
                rootEl.value = rootEl.innerHTML;
            } else {
                rootEl.value = '';
            }
        },

        ensureEditable () {
            const { dom } = this;
            const rootEl = dom.el[0];

            if (!rootEl.hasAttribute('contenteditable')) {
                rootEl.contentEditable = true;
            }
        },

        ensureDefaultBlock () {
            const { dom, mediator } = this;
            const rootEl = dom.el[0];

            if (!/\w+/.test(rootEl.textContent)) {
                rootEl.innerHTML = '<p>&nbsp;</p>';
                mediator.exec('selection:select:contents', rootEl.childNodes[0]);
            }
        },

        getToolbarButtons () {
            const { dom } = this;
            const { toolbarButtons } = dom.el[0].dataset;
            let buttonArray = [];

            if (toolbarButtons) {
                buttonArray = JSON.parse(toolbarButtons);
            }

            return buttonArray;
        },

        insertHTML (html) {
            const { mediator } = this;

            if (document.queryCommandSupported('insertHTML')) {
                document.execCommand('insertHTML', null, html);
            } else {
                let currentSelection = mediator.get('selection:current');
                let currentRange = mediator.get('selection:range');

                currentRange.deleteContents();

                let tmpContainer = document.createElement('container');
                tmpContainer.innerHTML = html;

                let docFrag = document.createDocumentFragment();
                let node, lastNode;

                while ((node = tmpContainer.firstChild)) {
                    lastNode = docFrag.appendChild(node);
                }
                currentRange.insertNode(docFrag);

                if (lastNode) {
                    currentRange = currentRange.cloneRange();
                    currentRange.setStartAfter(lastNode);
                    currentRange.collapse(true);
                    currentSelection.removeAllRanges();
                    currentSelection.addRange(currentRange);
                }
            }
        },

        reFocus () {
            const { dom } = this;
            dom.el[0].focus();
        },

        getContentEditableElement () {
            const { dom } = this;
            return dom.el[0];
        },

        cleanup (opts={}) {
            const { dom, mediator } = this;
            const rootEl = dom.el[0];
            mediator.exec('format:clean', rootEl);
        },

        setCleanupTimeout () {
            const { props } = this;
            props.cleanupTimeout = setTimeout(() => {
                this.cleanup();
            }, 250);
        },

        clearCleanupTimeout () {
            const { props } = this;
            if (props.cleanupTimeout) {
                clearTimeout(props.cleanupTimeout);
                props.cleanupTimeout = null;
            }
        },

        // DOM Event Handlers
        handleFocus () {
            const { mediator } = this;
            this.clearCleanupTimeout();
            this.ensureDefaultBlock();
            this.updatePlaceholderState();
            mediator.emit('contenteditable:focus');
        },

        handleKeyup (evnt) {
            const { mediator, dom } = this;
            const keyCode = evnt.which || evnt.keyCode;
            const anchorNode = mediator.get('selection:anchornode');

            function CustomEvent(event, params) {
                var evt;
                params = params || { bubbles: true, cancelable: true, detail: undefined };
                evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            }

            switch (keyCode) {
            case keycodes.ENTER:
                setTimeout(() => {
                    mediator.emit('contenteditable:newline');
                }, 100);
                break;
            case keycodes.BACKSPACE:
                if (!anchorNode.textContent.trim().length || (anchorNode.hasAttribute && anchorNode.hasAttribute('contenteditable'))) {
                    mediator.emit('contenteditable:newline');
                }
                break;
            case keycodes.TAB:
                mediator.emit('contenteditable:tab:up', evnt);
                break;
            }

            dom.el[0].dispatchEvent(new CustomEvent('change'));

            this.updateValue();
            this.updatePlaceholderState();
        },

        handleKeydown (evnt) {
            const { mediator } = this;
            const keyCode = evnt.which || evnt.keyCode;

            setTimeout(() => {
                this.updatePlaceholderState();
            }, 25);

            switch (keyCode) {
            case keycodes.TAB:
                mediator.emit('contenteditable:tab:down', evnt);
                break;
            }
        },

        handleBlur () {
            const { mediator } = this;
            this.updatePlaceholderState();
            this.updateValue();
            this.setCleanupTimeout();
            mediator.emit('contenteditable:blur');
        },

        handlePaste (evnt) {
            const { mediator } = this;
            mediator.emit('contenteditable:paste', evnt);
            this.updateValue();
        },

        handleMouseOver (evnt) {
            const { mediator } = this;
            if (evnt.target.nodeName === 'A') {
                mediator.emit('contenteditable:mouseover:anchor', evnt);
            }
        },

        handleMouseOut (evnt) {
            const { mediator } = this;
            if (evnt.target.nodeName === 'A') {
                mediator.emit('contenteditable:mouseout:anchor', evnt);
            }
        },

        handleClick (evnt) {
            const { dom } = this;
            const rootEl = dom.el[0];

            if (DOM.isIn(evnt.target, 'A', rootEl)) {
                evnt.preventDefault();
                evnt.stopPropagation();
            }
        },

        handleInput () {
            this.updateValue();
        }
    }
});

export default ContentEditable;
