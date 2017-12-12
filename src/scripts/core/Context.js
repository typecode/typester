// jshint strict: false

/**
* @access protected
*/
const Context = function (...contexts) {
    this.mixin(...contexts);
};

Object.assign(Context.prototype, {
    mixin (...contexts) {
        contexts.forEach((context) => {
            Object.assign(this, context);
        });
    },

    extendWith (mixinContext, opts={}) {
        if (opts.keys) {
            opts.keys.forEach((key) => {
                this[key] = mixinContext[key];
            });
        } else {
            this.mixin(mixinContext);
        }
    }
});

export default Context;
