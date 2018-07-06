// jshint strict: false

/**
 * Module -
 * A factory for building module classes.
 * Modules are built up from a module dictionary/object.
 *
 * @module core/Module
 * @access protected
 *
 * @example
 * import Module from '../core/Module'
 * const MyModule = Module({
 *   name: 'MyModule', // Required
 *
 *   // An object that is mixed into the module context that is bound to the methods
 *   props: {
 *     foo: "bar" // -> this.foo inside methods
 *   },
 *
 *   requiredProps: ['foo'], // An array listing the keys of props that are required
 *
 *   // An object map used to declare handler strings ~> method names: @see core/Mediator
 *   handlers: {
 *     requests: {},
 *     commands: {},
 *     events: {},
 *     domEvents: {}
 *   },
 *
 *   // An object map used to get dom elements and cache them to keys on the contect
 *   dom: {
 *     'myModuleElem': '.my-module-elem' // Accessable via this.dome.myModule
 *   },
 *
 *   // An object of methods to be bound to the module's context
 *   methods: {
 *     setup () {}, // The module setup hook. Called before the module initialized
 *     init () {} // The init hook. Called once the modules has been initialized,
 *     ... // The rest is up to the developer
 *  }
 * })
 */

import Context from './Context';
import func from '../utils/func';
import DOM from '../utils/DOM';

const Module = function (moduleObj) {
    const {
        name: moduleName,
        props: moduleProps,
        handlers: moduleHandlers,
        dom: moduleDom,
        methods: moduleMethods,
        requiredProps: moduleRequiredProps,
        acceptsConfigs: moduleAcceptsConfigs
    } = moduleObj;

    if (!moduleName) {
        throw new Error('No name given for module', moduleObj);
    }

    const moduleUtils = {
        createContext (...contexts) {
            return new Context(...contexts);
        },

        bindMethods (methods, context) {
            methods = methods || {};
            return func.bindObj(methods, context);
        },

        wrapRenderMethod (renderMethod, opts) {
            const wrappedRenderMethod = function (...args) {
                let { context } = opts;
                let mergedDom;

                mergedDom = moduleUtils.mergeDom(moduleDom, opts.dom);
                mergedDom.el = renderMethod(...args);

                moduleUtils.getDom(mergedDom);
                context.extendWith({ dom: mergedDom });

                if (moduleHandlers.domEvents) {
                    moduleUtils.registerDomHandlers(moduleHandlers.domEvents, context);
                }
            };
            return wrappedRenderMethod;
        },

        registerHandlers (mediator, handlers, context) {
            Object.keys(handlers).forEach((handlerKey) => {
                const handlerMap = handlers[handlerKey];
                let handlerMethods = moduleUtils.getHandlerMethods(handlerMap, context);
                switch (handlerKey) {
                case 'requests':
                    mediator.registerRequestHandlers(handlerMethods);
                    break;
                case 'commands':
                    mediator.registerCommandHandlers(handlerMethods);
                    break;
                case 'events':
                    mediator.registerEventHandlers(handlerMethods);
                    break;
                }
            });
        },

        registerDomHandlers (domHandlersMap, context) {
            let handlerMethods = moduleUtils.getHandlerMethods(domHandlersMap, context);
            moduleUtils.bindDomEvents(handlerMethods, context);
        },

        getHandlerMethods (handlerMap, context) {
            let routedHandlers = {};

            Object.keys(handlerMap).forEach((commandStr) => {
                const methodKey = handlerMap[commandStr];
                const handlerMethod = context[methodKey];
                routedHandlers[commandStr] = handlerMethod;
            });

            return routedHandlers;
        },

        mergeDom (defaultDom, dom={}) {
            let mergedDom = {};

            Object.keys(defaultDom).forEach((domKey) => {
                mergedDom[domKey] = defaultDom[domKey];
            });

            Object.keys(dom).forEach((domKey) => {
                mergedDom[domKey] = dom[domKey];
                mergedDom[domKey].selector = dom[domKey];
            });

            return mergedDom;
        },

        getDom (dom) {
            const rootEl = dom.el || document.body;

            Object.keys(dom).forEach((domKey) => {
                let selector, domEl;

                selector = dom[domKey];
                if (selector === null) {
                    return;
                } else if (typeof selector === 'object') {
                    selector = selector.selector || selector;
                }

                domEl = DOM.get(selector, rootEl);
                domEl.selector = selector;

                dom[domKey] = domEl;
            });
        },

        bindDomEvents (handlers, context) {
            const { dom } = context;

            Object.keys(handlers).forEach((eventElKey) => {
                const [eventKey, elemKey] = eventElKey.split(' @');
                const elem = elemKey ? dom[elemKey][0] : dom.el[0];
                const eventHandler = handlers[eventElKey];

                elem.addEventListener(eventKey, eventHandler);
            });
        },

        mergeProps (defaultProps, props={}) {
            let mergedProps = {};

            Object.keys(defaultProps).forEach((propKey) => {
                const propValue = props[propKey] || defaultProps[propKey];
                mergedProps[propKey] = propValue;
            });

            return mergedProps;
        },

        validateProps (props, requiredProps) {
            Object.keys(props).forEach((propKey) => {
                if (requiredProps.indexOf(propKey) > -1 && !props[propKey]) {
                    throw new Error(`${moduleName} requires prop: ${propKey}`);
                }
            });
        }
    };

    const moduleProto = {
        moduleConstructor: function (opts) {
            moduleProto.prepModule(opts);
            moduleProto.bindConfigs(opts);
            moduleProto.buildModule(opts);
            moduleProto.setupModule(opts);
            moduleProto.renderModule(opts);
            moduleProto.initModule(opts);
        },

        prepModule (opts) {
            const context = moduleUtils.createContext();

            if (moduleProps) {
                const mergedProps = moduleUtils.mergeProps(moduleProps, opts.props);
                context.extendWith({ props: mergedProps});

                if (moduleRequiredProps) {
                    moduleUtils.validateProps(mergedProps, moduleRequiredProps);
                }
            }

            opts.context = context;
        },

        bindConfigs (opts) {
            if (!moduleAcceptsConfigs) { return; }

            const { context } = opts;
            const optsConfigs = opts.configs || {};
            let moduleConfigs = {};

            moduleAcceptsConfigs.forEach((configKey) => {
                moduleConfigs[configKey] = optsConfigs[configKey] || {};
            });

            context.extendWith({ configs: moduleConfigs });
        },

        buildModule (opts) {
            const { context } = opts;
            const boundMethods = moduleUtils.bindMethods(moduleMethods, context);

            if (boundMethods.render) {
                boundMethods.render = moduleUtils.wrapRenderMethod(boundMethods.render, opts);
            }

            context.extendWith(boundMethods);
            context.extendWith({mediator: opts.mediator});
        },

        setupModule (opts) {
            const { context } = opts;
            if (context.setup) {
                context.setup();
            }

            if (moduleHandlers) {
                moduleUtils.registerHandlers(opts.mediator, moduleHandlers, context);
            }
        },

        renderModule (opts) {
            let { context } = opts;
            let mergedDom;

            if (context.render) {
                return;
            }

            if (moduleDom) {
                mergedDom = moduleUtils.mergeDom(moduleDom, opts.dom);
                moduleUtils.getDom(mergedDom);
                context.extendWith({dom: mergedDom});
            }

            if (moduleHandlers.domEvents) {
                moduleUtils.registerDomHandlers(moduleHandlers.domEvents, context);
            }
        },

        initModule (opts) {
            const { context } = opts;

            if (context.init) {
                context.init();
            }
        },

        destroyModule () {

        }
    };

    return moduleProto.moduleConstructor;
};

export default Module;
