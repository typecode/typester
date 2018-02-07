/**
 * The main config.
 * @access protected
 * @module config/config
 *
 * @example
 * config.defaultBlock = "P" // the defaultBlock formatting to use when creating a new line etc.
 * config.blockElementName = [ ... ] // a list of all the expected block level element names.
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
