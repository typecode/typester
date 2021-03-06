// jshint strict: false

/**
 * func -
 * namespaced collection of utililty methods for binding function contexts.
 * @access protected
 */
const func = {
    bind (func, context) {
        return (...args) => {
            return func.apply(context, args);
        };
    },

    bindObj (funcObj, context) {
        let boundFuncObj = {};

        Object.keys(funcObj).forEach((funcKey) => {
            boundFuncObj[funcKey] = func.bind(funcObj[funcKey], context);
        });

        return boundFuncObj;
    }
};

export default func;
