import Module from '../core/Module';
import browser from '../utils/browser';

const Commands = Module({
    name: 'Commands',
    props: {},

    handlers: {
        commands: {
            'commands:exec' : 'exec',
            'commands:format:default' : 'defaultBlockFormat',
            'commands:format:block' : 'formatBlock'
        }
    },

    methods: {
        setup () {},
        init () {},

        exec ({command, value = null, contextDocument = document}) {
            if (command === 'formatBlock') {
                value = this.prepBlockValue(value);
            }
            contextDocument.execCommand(command, false, value);
        },

        formatBlock ({ style, contextDocument=document }) {
            this.exec({
                command: 'formatBlock',
                value: style,
                contextDocument
            });
        },

        defaultBlockFormat ({ contextDocument=document }) {
            const { mediator } = this;
            const defaultBlock = mediator.get('config:defaultBlock');
            this.formatBlock({
                style: defaultBlock,
                contextDocument
            });
        },

        prepBlockValue (value) {
            const ieVersion = browser.ieVersion();
            value = value.toUpperCase();
            return ieVersion && ieVersion < 12 ? `<${value}>` : value;
        }
    }
});

export default Commands;
