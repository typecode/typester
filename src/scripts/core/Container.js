// jshint strict: false

import Mediator from './Mediator';
import Context from './Context';
import func from '../utils/func';

/**
* @access protected
*/
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
