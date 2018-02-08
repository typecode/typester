// jshint strict: false

/**
 * guid - generates guids.
 * @access protected
 * @return {string}  guid
 */
const guid = function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

export default guid;
