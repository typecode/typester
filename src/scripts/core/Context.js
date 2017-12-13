// jshint strict: false


/**
 * ## Context
 * Instance safe context builder that can mixin multiple additional objects as
 * contexts. These can then be used to bind methods into a shared context.
 *
 * @param  {array} contexts - A collection of contexts to mix into the returned context.
 * @return {object} - A context
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
