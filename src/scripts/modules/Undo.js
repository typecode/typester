import Module from '../core/Module';
import DOM from '../utils/DOM';

const Undo = Module({
    name: 'Undo',
    props: {
        contentEditableElem: null,
        currentHistoryIndex: -1,
        history: []
    },

    handlers: {
        events: {
            'contenteditable:mutation:observed': 'handleMutation',
            'contenteditable:focus': 'handleFocus'
        }
    },

    methods: {
        setup () {},
        init () {
            console.log('Undo init');
        },

        handleMutation () {
            console.log('Undo handleMutation');
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

            console.log(
                JSON.parse(
                    JSON.stringify({
                        states,
                        currentHistoryIndex,
                        history,
                        isUndo,
                        isRedo,
                        noChange
                    })
                )
            );

            if (noChange) {
                props.history[currentHistoryIndex] = states.current;
            } else if (!isUndo && !isRedo) {
                props.history.length = currentHistoryIndex + 1;
                props.history.push(states.current);
                props.currentHistoryIndex += 1;
            } else if (isUndo) {
                props.currentHistoryIndex -= 1;
                mediator.exec('format:clean', props.contentEditableElem);
                mediator.exec('selection:select:coordinates', states.previous.selectionRangeCoordinates);
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

        createHistoryState () {
            const { mediator, props } = this;
            const editableContentString = DOM.nodesToHTMLString(DOM.cloneNodes(props.contentEditableElem, { trim: true })).replace(/\u200B/g, '').trim();
            const selectionRangeCoordinates = mediator.get('selection:range:coordinates');

            return {
                editableContentString,
                selectionRangeCoordinates
            };
        },

        analyzeStates (states) {
            const {
                current,
                previous,
                beforePrevious,
                next,
                afterNext
            } = states;
            let isUndo = beforePrevious && current.editableContentString === beforePrevious.editableContentString;
            let isRedo = next && current.editableContentString === next.editableContentString;
            let noChange = previous && current.editableContentString === previous.editableContentString;

            isUndo = isUndo || false;
            isRedo = isRedo || false;
            noChange = noChange || false;

            if (!isUndo && !isRedo && !noChange && previous) {
                console.log(previous.editableContentString);
                console.log(current.editableContentString);
            }
            return {
                isUndo,
                isRedo,
                noChange
            }
        }
    }
})

export default Undo;
