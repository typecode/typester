// jshint strict: false

/**
 * Container -
 * A factory for building container classes.
 * Containers are built up of a mediator instance that is shared with its child
 * modules.
 *
 * @module core/Container
 * @access protected
 *
 * @param  {object} containerObj - **(Required)** A descriptor of the container
 * @param  {string} containerObj.name - **(Required)** The name of the container
 * @param  {object} containerObj.handlers - A map of mediator event strings and method names: 'event:string' : 'methodName'.
 *                                          Event strings are then mapped to the named method.
 * @param  {object} containerObj.methods - A map of named methods.
 * @param  {array} containerObj.modules - An array of modules to be instantiated by the container. [{ class: ModuleClass }]
 * @param  {object} containerObj.mediatorOpts - A map of options to be passed on to the {@link Mediator}.
 * @param  {mediator} containerObj.mediator - A mediator instance to act as a parent for the mediator instance created in this container.
 *
 * @return {function} - A container class that can be instantiated.
 *
 * @example
 * import MyModule from '../modules/MyModule.js';
 *
 * const MyContainer = Container({
 *   name: 'MyContainer',
 *   modules: [
 *     { class: MyModule }
 *   ],
 *   handlers: {
 *     requests: { // Request handlers mapped to methods & registered with the mediator
 *       'mycontainer:request:something' : 'getSomething'
 *     },
 *     commands: { // Command handlers mapped to methods & registered with the mediator
 *       'mycontainer:do:something' : 'doSomething'
 *     },
 *     events: { // Event handlers mapped to methods & registered with the mediator
 *       'module:event' : 'handlerMethod'
 *     }
 *   },
 *   methods: {
 *     setup () {}, // A setup hook called before modules and child containers are initialized.
 *     init () {} // An init hook called after all modules and child containers have been initialized.
 *
 *     // The rest of the methods required for this container.
 *     getSomething () {},
 *     doSomething () {},
 *     handlerMethod () {}
 *   }
 * });
 *
 * const myContainer = new MyContainer(containerOpts);
 *
 * // myContainer has a method you can use to update the parent mediator using:
 * myContainer.setMediatorParent(mediatorInstance);
 */

import Mediator from './Mediator';
import Context from './Context';
import func from '../utils/func';

const Container = function Container(containerObj) {

    const {
        name: containerName,
        handlers: containerHandlers,
        methods: containerMethods,
        modules: containerModules,
        containers: containerChildContainers,
        mediatorOpts
    } = containerObj;

    if (!containerName) {
        throw new Error('No name given for container');
    }

    const containerUtils = {
        createContext (...contexts) {
            return new Context(...contexts);
        },

        bindMethods (methods, context) {
            methods = methods || {};
            return func.bindObj(methods, context);
        },

        initModules (modules=[], opts={}) {
            modules.forEach((module) => {
                const moduleOpts = Object.assign({}, opts, (module.opts || {}));
                console.log({moduleOpts});
                module.instance = new module.class(moduleOpts);
            });
        },

        initChildContainers (childContainers=[], opts={}) {
            childContainers.forEach((containerObj) => {
                const containerOpts = Object.assign({}, opts, (containerObj.opts || {}));
                containerObj.instance = new containerObj.class(containerOpts);
            });
        },

        registerHandlers (mediator, handlers, context) {
            Object.keys(handlers).forEach((handlerKey) => {
                const handlerMap = handlers[handlerKey];
                let handlerMethods = containerUtils.getHandlerMethods(handlerMap, context);

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

        getHandlerMethods (handlerMap, context) {
            let routedHandlers = {};

            Object.keys(handlerMap).forEach((commandStr) => {
                const methodKey = handlerMap[commandStr];
                const handlerMethod = context[methodKey];
                routedHandlers[commandStr] = handlerMethod;
            });

            return routedHandlers;
        }
    };

    const containerProto = {
        containerConstructor: function (opts={}) {
            const context = containerUtils.createContext();
            const boundMethods = containerUtils.bindMethods(containerMethods, context);
            context.extendWith(boundMethods);
            const mediator = new Mediator(Object.assign({ parent: opts.mediator }, mediatorOpts));
            context.extendWith({ mediator });

            if (containerHandlers) {
                containerUtils.registerHandlers(mediator, containerHandlers, context);
            }

            if (boundMethods.setup) {
                boundMethods.setup();
            }

            containerUtils.initModules(containerModules, {
                dom: opts.dom,
                mediator
            });

            containerUtils.initChildContainers(containerChildContainers, {
                dom: opts.dom,
                mediator
            });

            if (boundMethods.init) {
                boundMethods.init();
            }

            return {
                setMediatorParent (parentMediator) {
                    mediator.setParent(parentMediator);
                }
            };
        }
    };

    return containerProto.containerConstructor;
};

export default Container;
