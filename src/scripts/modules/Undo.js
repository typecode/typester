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
                isRedo
            } = this.analyzeStates(states);

            console.log(Object.assign({}, {
                states,
                isUndo,
                isRedo
            }));

            if (!isUndo && !isRedo) {
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
            const editableContentString = DOM.nodesToHTMLString(DOM.cloneNodes(props.contentEditableElem, { trim: true })).replace(/\u200B/g, '');
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

            isUndo = isUndo || false;
            isRedo = isRedo || false;

            return {
                isUndo,
                isRedo
            }
        }
    }
})

export default Undo;
