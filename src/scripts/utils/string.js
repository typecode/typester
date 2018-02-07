// jshint strict: false

/**
 * string utilities
 * @access protected
 */
export default {
    capitalize (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
};
