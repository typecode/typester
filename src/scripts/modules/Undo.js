import Module from '../core/Module';
import DOM from '../utils/DOM';

const Undo = Module({
    name: 'Undo',
    props: {
        contentEditableElem: null,
        currentHistoryIndex: -1,
        history: [],
        ignoreSelectionChanges: false
    },

    handlers: {
        events: {
            'contenteditable:mutation:observed': 'handleMutation',
            'contenteditable:focus': 'handleFocus',
            'import:from:canvas:start': 'handleImportStart',
            'import:from:canvas:complete': 'handleImportComplete',
            'selection:change': 'handleSelectionChange',
            'export:to:canvas:start': 'handleExportStart'
        }
    },

    methods: {
        setup () {},
        init () {},

        handleMutation () {
            const { props, mediator } = this;
            const { history, currentHistoryIndex } = props;
            const states = {
                currentHistoryIndex,
                current: this.createHistoryState(),
                previous: history[currentHistoryIndex],
                beforePrevious: history[currentHistoryIndex - 1],
                next: history[currentHistoryIndex + 1],
                afterNext: history[currentHistoryIndex + 2]
            };

            const {
                isUndo,
                isRedo,
                noChange
            } = this.analyzeStates(states);

            if (noChange) {
                return;
            } else if (!isUndo && !isRedo) {
                props.history.length = currentHistoryIndex + 1;
                props.history.push(states.current);
                props.currentHistoryIndex += 1;
            } else if (isUndo) {
                props.currentHistoryIndex -= 1;
                mediator.exec('format:clean', props.contentEditableElem);
                mediator.exec('selection:select:coordinates', states.beforePrevious.selectionRangeCoordinates);
            } else if (isRedo) {
                props.currentHistoryIndex += 1;
                mediator.exec('format:clean', props.contentEditableElem);
                mediator.exec('selection:select:coordinates', states.next.selectionRangeCoordinates);
            }
        },

        handleFocus () {
            const { mediator, props } = this;
            const contentEditableElem = mediator.get('contenteditable:element');

            if (props.contentEditableElem !== contentEditableElem) {
                setTimeout(() => {
                    props.contentEditableElem = contentEditableElem;
                    props.history = [this.createHistoryState()];
                    props.currentHistoryIndex = 0;
                }, 150);
            }
        },

        handleImportStart () {
            const { props } = this;
            props.ignoreSelectionChanges = true;
        },

        handleImportComplete () {
            const { props } = this;
            props.ignoreSelectionChanges = false;
        },

        handleExportStart () {
            this.updateCurrentHistoryState();
        },

        handleSelectionChange () {
            const { props } = this;
            if (!props.ignoreSelectionChanges) {
                this.updateCurrentHistoryState();
            }
        },

        updateCurrentHistoryState () {
            const { props } = this;
            const { history, currentHistoryIndex } = props;
            const currentHistoryState = history[currentHistoryIndex];

            if (currentHistoryState) {
                this.cacheSelectionRangeOnState(currentHistoryState);
            }
        },

        createHistoryState () {
            const { props } = this;

            if (!props.contentEditableElem) { return; }

            const editableContentString = DOM.nodesToHTMLString(DOM.cloneNodes(props.contentEditableElem, { trim: true })).replace(/\u200B/g, '');
            const historyState = {
                editableContentString,
            };

            this.cacheSelectionRangeOnState(historyState);

            return historyState;
        },

        cacheSelectionRangeOnState (state) {
            const { mediator } = this;
            state.selectionRangeCoordinates = mediator.get('selection:range:coordinates');
        },

        analyzeStates (states) {
            const {
                current,
                previous,
                beforePrevious,
                next
            } = states;
            let isUndo = beforePrevious && current.editableContentString === beforePrevious.editableContentString;
            let isRedo = next && current.editableContentString === next.editableContentString;
            let noChange = previous && current.editableContentString === previous.editableContentString;

            isUndo = isUndo || false;
            isRedo = isRedo || false;
            noChange = noChange || false;

            return {
                isUndo,
                isRedo,
                noChange
            };
        }
    }
});

export default Undo;
