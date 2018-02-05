/**
 * A config object. Was meant to be more than this. Will revise.
 * At the moment it just specifies that the defalt block type is "P"
 *
 * @access protected
 * @module config/config
 */

export default {
    defaultBlock: 'P',
    blockElementNames: [
        'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'li', 'p', 'pre',
        'address', 'article', 'aside', 'canvas', 'dd', 'div', 'dl', 'dt',
        'fieldset', 'figcaption', 'figure', 'footer', 'form', 'header', 'hgroup',
        'hr', 'main', 'nav', 'noscript', 'output', 'section', 'table', 'tfoot',
        'video'
    ]
};
