// jshint strict: false

import selectionHelper from './selection';
import mockEvents from './mockEvents';

const userInputHelper = {
    focus (elem) {
        elem.focus();
        selectionHelper.selectAll(elem);
        mockEvents.focus(elem);
    }
};

export default userInputHelper;
