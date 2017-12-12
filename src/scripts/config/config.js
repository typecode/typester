/**
* @access protected
*/
export default {
    commands: {
        bold: {
            tags: ['B', 'STRONG'],
            togglable: true
        },
        italic: {
            tags: ['I'],
            togglable: true
        },
        formatBlock: {
            tags: [
                'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P',
                'BLOCKQUOTE'
            ],
            unwrapIfIn: [
                'bold',
                'formatBlock',
                'insertOrderedList',
                'insertUnorderedList'
            ]
        },
        insertOrderedList: {
            tags: ['OL', 'LI'],
            unwrapIfIn: [
                'formatBlock'
            ],
            togglable: true
        },
        insertUnorderedList: {
            tags: ['UL', 'LI'],
            unwrapIfIn: [
                'formatBlock'
            ],
            togglable: true
        },
        createLink: {
            tags: ['A']
        }
    },
    defaultBlock: 'P',
    paste: {
        invalidTags: ['SCRIPT', 'LINK', 'IMG']
    },
    global: {},
    toolbar: {},
    contentEditable: {}
};
