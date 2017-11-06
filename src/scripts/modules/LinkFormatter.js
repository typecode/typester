// jshint strict: false

import Module from '../core/Module';
import commands from '../utils/commands';
import DOM from '../utils/DOM';

import inputFormTemplate from '../../templates/inputForm.html';
import linkDisplayTemplate from '../../templates/linkDisplay.html';

import inputFormStyles from '../../styles/inputForm.scss';

const LinkFormatter = Module({
    name: 'LinkFormatter',
    props: {
        urlRegex: /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
        styles: null,
        currentAnchor: null,
        active: false,
        hasMouse: false,
        showing: null,
        hideTimeout: null,
        initialEvent: null,
        targetEl: null,
        hasRendered: null
    },
    dom: {
        'userInput': '.user-input'
    },
    handlers: {
        requests: {
            'format:link:active': 'isActive'
        },
        commands: {
            'format:link' : 'formatLink'
        },
        events: {
            'app:destroy' : 'destroy',
            'contenteditable:mouseover:anchor' : 'showLinkFlyout',
            'contenteditable:mouseout:anchor' : 'hideFlyout',
            'selection:update': 'handleSelectionChange',
            'selection:change': 'handleSelectionChange',
            'contenteditable:blur': 'handleContentEditableBlur'
        },
        domEvents: {
            'submit' : 'handleSubmit',
            'click' : 'handleClick',
            'mouseover': 'handleMouseOver',
            'mouseout' : 'handleMouseOut'
        }
    },
    methods: {
        setup () {
            this.appendStyles();
        },

        appendStyles () {
            const { props } = this;
            props.styles = DOM.addStyles(inputFormStyles);
        },

        formatLink () {
            if (this.isInLink()) {
                this.removeLink();
            } else {
                this.showLinkFormFlyout();
            }
        },

        isInLink () {
            const { mediator } = this;
            return mediator.get('selection:in:or:contains', ['A']);
        },

        showLinkFormFlyout (data) {
            const { mediator, props } = this;
            const linkForm = this.compileLinkForm(data);

            props.showing = 'linkForm';
            this.render({ content: linkForm });
            mediator.exec('selection:wrap:pseudo');
            this.focusInput();
            this.bindInput();
        },

        showLinkFlyout (evnt) {
            const { props, mediator } = this;
            const anchor = DOM.getClosest(evnt.target, 'A');

            if (
                mediator.get('selection:contains:node', anchor) ||
                props.showing === 'linkForm'
            ) {
                return;
            }

            this.clearHideTimeout();

            const linkDisplay = this.compileLinkDisplay({ href: anchor.href });

            props.initialEvent = evnt;
            props.targetEl = anchor;
            this.render({
                content: linkDisplay,
                flyoutPlacement: 'below'
            });
            props.showing = 'linkDisplay';
            props.currentAnchor = anchor;
        },

        hideFlyout () {
            const { props } = this;
            props.hideTimeout = setTimeout(() => {
                if (!this.isActive() && props.hasRendered) {
                    this.destroy();
                }
            }, 350);
        },

        clearHideTimeout () {
            const { props } = this;
            if (props.hideTimeout) {
                clearTimeout(props.hideTimeout);
                props.hideTimeout = null;
            }
        },

        compileLinkForm (data) {
            const wrapperEl = document.createElement('div');
            let inputFormHTML = inputFormTemplate(data);

            if (typeof inputFormHTML === 'string') {
                wrapperEl.innerHTML = inputFormHTML;
            } else {
                wrapperEl.appendChild(inputFormHTML[0]);
            }

            return wrapperEl.childNodes[0];
        },

        compileLinkDisplay (data) {
            const wrapperEl = document.createElement('div');
            let inputFormHTML = linkDisplayTemplate(data);

            if (typeof inputFormHTML === 'string') {
                wrapperEl.innerHTML = inputFormHTML;
            } else {
                wrapperEl.appendChild(inputFormHTML[0]);
            }

            return wrapperEl.childNodes[0];
        },

        render (opts) {
            const { mediator, props } = this;

            props.hasMouse = false;
            props.flyout = props.flyout || mediator.get('flyout:new');
            props.flyout.clearContent();
            props.flyout.setPlacement(opts.flyoutPlacement);
            props.flyout.appendContent(opts.content);

            this.positionFlyout(opts);
            this.showFlyout();

            props.hasRendered = true;
            return props.flyout.el;
        },

        positionFlyout (opts) {
            const { mediator, props } = this;
            const { initialEvent, targetEl } = props;
            let targetBounds, elStyles, elLineHeight, lineCount, lineStepHeight;

            if (targetEl) {
                targetBounds = targetEl.getBoundingClientRect();
                elStyles = window.getComputedStyle(targetEl);
                elLineHeight = parseInt(elStyles.getPropertyValue('line-height'), 10);
                lineCount = Math.ceil(targetBounds.height / elLineHeight);
                lineStepHeight = targetBounds.height / lineCount;
            } else {
                targetBounds = mediator.get('selection:bounds');
            }

            if (targetBounds.width > 0) {
                const scrollOffset = DOM.getScrollOffset();
                let docRelTop, docRelCenter;

                if (initialEvent) {
                    const topDiff = initialEvent.clientY - targetBounds.top;

                    docRelTop = initialEvent.clientY;
                    docRelCenter = initialEvent.clientX;

                    if (opts.flyoutPlacement === 'below') {
                        docRelTop = targetBounds.top + (lineStepHeight * Math.ceil(topDiff / lineStepHeight));
                    } else {
                        docRelTop = targetBounds.top + (lineStepHeight * Math.floor(topDiff / lineStepHeight));
                    }
                } else {
                    docRelTop = (opts.flyoutPlacement === 'below' ? targetBounds.bottom : targetBounds.top);
                    docRelCenter = targetBounds.width / 2 + targetBounds.left + scrollOffset.x;
                }

                docRelTop += scrollOffset.y;

                props.flyout.position({
                    left: docRelCenter + 'px',
                    top: docRelTop + 'px'
                });
            }
        },

        showFlyout () {
            const { mediator, props } = this;
            props.flyout.show();
            mediator.exec('toolbar:hide');
        },

        focusInput () {
            const { dom } = this;
            dom.userInput[0].focus();
        },

        bindInput () {
            const { dom, props } = this;
            dom.userInput[0].addEventListener('blur', this.handleBlur);
            props.userInputBound = true;
        },

        unbindInput () {
            const { dom, props } = this;
            if (props.userInputBound) {
                props.userInputBound = false;
                dom.userInput[0].removeEventListener('blur', this.handleBlur);
            }
        },

        handleSubmit (evnt) {
            evnt.preventDefault();
            const formJSON = this.processForm();
            if (formJSON['user-input']) {
                this.createLink(formJSON);
            } else {
                this.removeLink({ byPseudo: true });
            }
        },

        handleClick (evnt) {
            const { mediator, props } = this;
            if (evnt.target.nodeName === 'A') {
                evnt.preventDefault();
                mediator.exec('selection:wrap:element', props.currentAnchor, { silent: true });
                this.showLinkFormFlyout({ value: props.currentAnchor.href });
            }
        },

        handleMouseOver () {
            const { props } = this;
            props.hasMouse = true;
        },

        handleMouseOut () {
            const { props } = this;
            props.hasMouse = false;

            if (props.showing === 'linkDisplay') {
                this.hideFlyout();
            }
        },

        handleBlur () {
            const { props } = this;
            if (props.blurTimeout) {
                clearTimeout(props.blurTimeout);
            }

            props.blurTimeout = setTimeout(() => {
                this.hideFlyout();
            }, 100);
        },

        handleSelectionChange () {
            if (
                !this.isActive()
            ) {
                this.hideFlyout();
            }
        },

        handleContentEditableBlur () {
            this.hideFlyout();
        },

        isActive () {
            const { props, dom } = this;
            return props.hasMouse || (dom && document.activeElement === dom.userInput[0]) || props.showingLinkFlyout;
        },

        processForm () {
            const { dom } = this;
            const formInputs = dom.el[0].querySelectorAll('input, select, textarea');
            let formJSON = {};

            for (let i = 0; i < formInputs.length; i++) {
                let inputEl = formInputs[i];
                let inputName = inputEl.name;
                let inputValue = inputEl.value;

                if (inputName) {
                    formJSON[inputName] = inputValue;
                }
            }

            return formJSON;
        },

        processLinkInput (linkInput) {
            const { props } = this;

            if (props.urlRegex.test(linkInput) && linkInput.indexOf('//') < 0) {
                linkInput = 'http://' + linkInput;
            }

            return linkInput;
        },

        createLink (formJSON) {
            const { mediator } = this;

            if (formJSON['user-input']) {
                const linkURL = this.processLinkInput(formJSON['user-input']);
                mediator.exec('selection:select:pseudo');
                commands.exec('unlink');
                commands.exec('createLink', linkURL);
            }

            this.destroy();
        },

        removeLink (opts={}) {
            const { mediator } = this;

            if (opts.byPseudo) {
                mediator.exec('selection:select:pseudo');
            } else {
                const anchorNode = mediator.get('selection:anchornode');
                const anchor = DOM.getClosest(anchorNode, 'A');
                mediator.exec('selection:wrap:element', anchor);
            }

            commands.exec('unlink');
            this.destroy();
        },

        destroy () {
            const { props, mediator } = this;
            if (props.flyout) {
                this.unbindInput();
                props.flyout.remove();
            }
            props.showing = null;
            props.hasMouse = false;
            props.hasRendered = null;
            mediator.exec('selection:select:remove:pseudo');
        }
    }
});

export default LinkFormatter;
