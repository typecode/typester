if (typeof Object.assign !== 'function') {
    Object.assign = function (target) { // .length of function is 2
        'use strict';
        var to, index, nextSource, nextKey;

        if (target === null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }

        to = Object(target);

        for (index = 1; index < arguments.length; index++) {
            nextSource = arguments[index];

            if (nextSource !== null) { // Skip over if undefined or null
                for (nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}
