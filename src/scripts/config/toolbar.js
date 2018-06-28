/**
 * The toolbar config. NB could do with a revision, some of the props in here could
 * be moved to the main config.
 * @access protected
 * @module config/toolbar
 */
import linkIcon from '../../templates/icons/link.html';
import orderedlistIcon from '../../templates/icons/orderedlist.html';
import unorderedlistIcon from '../../templates/icons/unorderedlist.html';
import quoteIcon from '../../templates/icons/quote.html';

const Toolbar = {
    buttons: ['bold', 'italic', 'h1', 'h2', 'orderedlist', 'unorderedlist', 'quote', 'link'],
    preventNewlineDefault: ['ul', 'ol'],
    blockTags: ['P'],
    validTags: ['P'],
    listTags: [],
    getValidTags () {
        let { validTags } = Toolbar;

        if ( validTags.length === 1 ) {
            Toolbar.parseForTagLists();
        }

        return Toolbar.validTags;
    },
    getBlockTags () {
        let { blockTags } = Toolbar;

        if ( blockTags.length === 1 ) {
            Toolbar.parseForTagLists();
        }

        return Toolbar.blockTags;

    },
    getListTags () {
        let { listTags } = Toolbar;

        if ( listTags.length === 0 ) {
            Toolbar.parseForTagLists();
        }

        return Toolbar.listTags;
    },
    parseForTagLists () {
        let {
            validTags,
            blockTags,
            listTags
        } = Toolbar;

        Toolbar.buttons.forEach((buttonKey) => {
            let buttonConfig = Toolbar.buttonConfigs[buttonKey];
            let configValidTags = buttonConfig.opts.validTags;

            validTags = validTags.concat(configValidTags);

            switch (buttonConfig.formatter) {
            case 'block':
                blockTags = blockTags.concat(configValidTags);
                break;
            case 'list':
                listTags = listTags.concat(configValidTags);
                break;
            }
        });

        Toolbar.validTags = validTags;
        Toolbar.blockTags = blockTags;
        Toolbar.listTags  = listTags;
    },
    buttonConfigs: {
        // Text styles
        bold: {
            formatter: 'text',
            opts: {
                style: 'bold',
                rootEl: 'b',
                validTags: ['B', 'STRONG']
            },
            content: '<b>B</b>',
            disabledIn: ['H1', 'H2', 'BLOCKQUOTE'],
            activeIn: ['B'],
            toggles: true
        },

        italic: {
            formatter: 'text',
            opts: {
                style: 'italic',
                rootEl: 'i',
                validTags: ['I']
            },
            content: '<i>I</i>',
            activeIn: ['I'],
            toggles: true
        },

        underline: {
            formatter: 'text:underline',
            content: '<u>U</u>'
        },

        strikethrough: {
            formatter: 'text:strikethrough',
            content: '<s>Abc</s>'
        },

        superscript: {
            formatter: 'text:superscript',
            content: '<sup>1</sup>'
        },

        subscript: {
            formatter: 'text:subscript',
            content: '<sub>1</sub>'
        },

        // Paragraph styles
        justifyCenter: {
            formatter: 'paragraph:justifyCenter'
        },

        justifyFull: {
            formatter: 'paragraph:justifyFull'
        },

        justifyLeft: {
            formatter: 'paragraph:justifyLeft'
        },

        justifyRight: {
            formatter: 'paragraph:justifyRight'
        },

        indent: {
            formatter: 'paragraph:indent'
        },

        outdent: {
            formatter: 'paragraph:outdent'
        },

        // Lists
        orderedlist: {
            formatter: 'list',
            content: orderedlistIcon({}, {}, true),
            opts: {
                style: 'ordered',
                validTags: ['OL', 'LI']
            },
            activeIn: ['OL']
        },

        unorderedlist: {
            formatter: 'list',
            content: unorderedlistIcon({}, {}, true),
            opts: {
                style: 'unordered',
                validTags: ['UL', 'LI']
            },
            activeIn: ['UL']
        },

        // Block level elements
        quote: {
            formatter: 'block',
            content: quoteIcon({}, {}, true),
            opts: {
                style: 'BLOCKQUOTE',
                validTags: ['BLOCKQUOTE']
            },
            activeIn: ['BLOCKQUOTE'],
            disabledIn (mediator) {
                let disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },
            toggles: true
        },

        pre: {
            formatter: 'block',
            opts: {
                style: 'PRE'
            },
            disabledIn (mediator) {
                let disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },
            content: 'PRE'
        },

        h1: {
            formatter: 'block',
            opts: {
                style: 'H1',
                validTags: ['H1']
            },
            content: 'H1',
            activeIn: ['H1'],
            disabledIn (mediator) {
                let disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },
            toggles: true
        },

        h2: {
            formatter: 'block',
            opts: {
                style: 'H2',
                validTags: ['H2']
            },
            content: 'H2',
            activeIn: ['H2'],
            disabledIn (mediator) {
                let disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },
            toggles: true
        },

        h3: {
            formatter: 'block',
            opts: {
                style: 'H3',
                validTags: ['H3']
            },
            content: 'H3',
            activeIn: ['H3'],
            disabledIn (mediator) {
                let disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },
            toggles: true
        },

        h4: {
            formatter: 'block',
            opts: {
                style: 'H4',
                validTags: ['H4']
            },
            content: 'H4',
            activeIn: ['H4'],
            disabledIn (mediator) {
                let disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },
            toggles: true
        },

        h5: {
            formatter: 'block',
            opts: {
                style: 'H5',
                validTags: ['H5']
            },
            content: 'H5',
            activeIn: ['H5'],
            disabledIn (mediator) {
                let disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },
            toggles: true
        },

        h6: {
            formatter: 'block',
            opts: {
                style: 'H6',
                validTags: ['H6']
            },
            content: 'H6',
            activeIn: ['H6'],
            disabledIn (mediator) {
                let disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },
            toggles: true
        },

        // Link
        link: {
            formatter: 'link',
            opts: {
                validTags: ['A']
            },
            content: linkIcon({}, {}, true),
            activeIn: ['A'],
            disabledIn (mediator) {
                let disabled = mediator.get('selection:spans:multiple:blocks');
                return disabled;
            }
        }
    }
};

export default Toolbar;
