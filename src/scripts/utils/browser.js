// jshint strict: false

/**
 * browser -
 * a utility to check browser version.
 * @access protected
 */
const browser = {
    // From https://codepen.io/gapcode/pen/vEJNZN
    ieVersion () {
        const ua = window.navigator.userAgent;

        const msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        const trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            const rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        const edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    },

    isIE () {
        const ieVersion = browser.ieVersion();
        return ieVersion && ieVersion < 12;
    },

    isFirefox () {
        return window.navigator.userAgent.indexOf('Firefox') > -1;
    }
};

export default browser;
