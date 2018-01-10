// jshint strict: false


/**
 * Context -
 * Instance safe context builder that can mixin multiple additional objects as
 * contexts. These can then be used to bind methods into a shared context.
 *
 * @module core/Context
 * @access protected
 *
 * @example
 * let context = new Context({ ping: 'pong' });
 * // context.ping = 'pong'
 *
 * context.mixin({ foo: 'bar' }, { jim: 'jam' })
 * // context.foo = 'bar'
 * // context.jim = 'jam'
 *
 * context.extendWith({ bing: 'bong', bang: 'boom' }, { keys: ['bing'] })
 * // context.bing = 'bong'
 * // context.bang = undefined
 */

/** @constructor Context */
const Context = function (...contexts) {
    this.mixin(...contexts);
};

Object.assign(Context.prototype, {
    /**
     * mixin - accepts additional contexts to mixin into itself
     * @param  {Array<Object>} ...contexts description
     */
    mixin (...contexts) {
        contexts.forEach((context) => {
            Object.assign(this, context);
        });
    },

    /**
     * extendWith - extend the current context with a single object. Allows for
     * the specification of specific keys to be cherry picked of the passed in
     * object.
     *
     * @param  {object} mixinContext the additional context to mix into the current context.
     * @param  {object} opts={}      options to allow for fine grained mixing in.
     * @param  {Array<string>} opts.keys a list of keys to cherry pick from the additional context.
     */
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
