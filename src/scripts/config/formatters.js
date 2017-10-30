const formatters = {
    base: {
        blockElementNames: [
            'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'li', 'p', 'pre',
            'address', 'article', 'aside', 'canvas', 'dd', 'div', 'dl', 'dt',
            'fieldset', 'figcaption', 'figure', 'footer', 'form', 'header', 'hgroup',
            'hr', 'main', 'nav', 'noscript', 'output', 'section', 'table', 'tfoot',
            'video'
        ]
    },

    text: {
        nodeLevel: Node.TEXT_NODE,
        changeLevel: {
            DOM: true,
            styles: false
        }
    },

    paragraph: {
        nodeLevel: Node.ELEMENT_NODE,
        changeLevel: {
            DOM: false,
            styles: true
        }
    },

    list: {
        nodeLevel: Node.ELEMENT_NODE,
        changeLevel: {
            DOM: true,
            styles: false
        },
        rootTags: ['ol', 'ul'],
        methods: {
            orderedlist: {
                rootTag: 'ol',
                tags: ['ol', 'li']
            },
            unorderedlist: {
                rootTag: 'ul',
                tags: ['ul', 'li']
            }
        }
    },

    block: {
        defaultElement: 'p',
        baseElement: 'div',
        nodeLevel: Node.ELEMENT_NODE,
        changeLevel: {
            DOM: true,
            styles: false
        }
    }
};

export default formatters;
