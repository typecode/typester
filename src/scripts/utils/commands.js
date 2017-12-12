// jshint strict: false
import conf from '../config/config';
import browser from './browser';

/**
* @access protected
*/
const commands = {
    exec (command, value=null, contextDocument=document) {
        if (command === 'formatBlock') {
            value = commands.prepBlockValue(value);
        }
        contextDocument.execCommand(command, false, value);
    },

    formatBlock (style, contextDocument=document) {
        commands.exec('formatBlock', style, contextDocument);
    },

    defaultBlockFormat (contextDocument=document) {
        commands.formatBlock(conf.defaultBlock, contextDocument);
    },

    prepBlockValue (value) {
        const ieVersion = browser.ieVersion();
        value = value.toUpperCase();
        return ieVersion && ieVersion < 12 ? `<${value}>` : value;
    }
};

export default commands;
