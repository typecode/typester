// jshint strict: false

import keycodes from '../../src/scripts/utils/keycodes';

(function () {
    if (typeof window.CustomEvent === "function") {
        return false; //If not IE
    }

    function CustomEvent(event, params) {
        var evt;
        params = params || { bubbles: true, cancelable: true, detail: undefined };
        evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();

const mockEvents = {
    keyup (key, eventTarget=document) {
        let event = new CustomEvent('keyup');
        event.keyCode = keycodes[key];
        eventTarget.dispatchEvent(event);
    },

    focus (eventTarget) {
        let event = new CustomEvent('focus');
        eventTarget.dispatchEvent(event);
    },

    click (eventTarget) {
        let event = new CustomEvent('click', { bubbles: true });
        eventTarget.dispatchEvent(event);
    },

    emit (eventTarget, eventStr) {
        let event = new CustomEvent(eventStr, { bubbles: true });
        eventTarget.dispatchEvent(event);
    },

    submit (eventTarget) {
        let event = new CustomEvent('submit', { bubbles: true });
        eventTarget.dispatchEvent(event);
    }
};

export default mockEvents;
