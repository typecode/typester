// jshint strict: false
import guid from '../utils/guid';

const Mediator = function (opts={}) {
    const internal = {
        parent: opts.parent,
        children: [],
        id: guid(),
        conceal: opts.conceal || []
    };

    const requests = {
        handlers: {},

        new (requestKey, requestHandler) {
            if (requests.handlers[requestKey]) {
                throw new Error(`Only one requestHandler per requestKey: ${requestKey}`);
            }

            requests.handlers[requestKey] = requestHandler;
        },

        getHandler (requestKey) {
            return requests.handlers[requestKey];
        },

        canHandle (requestKey) {
            return !!requests.getHandler(requestKey);
        },

        request (requestKey, options) {
            const requestHandler = requests.getHandler(requestKey);

            if (requestHandler) {
                return requestHandler(options);
            }
        }
    };

    const commands = {
        handlers: {},

        new (commandKey, commandHandler) {
            if (commands.handlers[commandKey]) {
                throw new Error(`Only one commandHandler per commandKey: ${commandKey}`);
            }

            commands.handlers[commandKey] = commandHandler;
        },

        getHandler (commandKey) {
            return commands.handlers[commandKey];
        },

        canHandle (commandKey) {
            return !!commands.getHandler(commandKey);
        },

        exec (commandKey, options) {
            const commandHandler = commands.getHandler(commandKey);
            if (commandHandler) {
                commandHandler(options);
            }
        }
    };

    const events = {
        handlers: {},

        new (eventKey, eventHandler) {
            events.handlers[eventKey] = events.handlers[eventKey] || [];
            events.handlers[eventKey].push(eventHandler);
        },

        getHandlers (eventKey) {
            return events.handlers[eventKey] || [];
        },

        canHandle (eventKey) {
            return !!events.getHandlers(eventKey);
        },

        emit (eventKey, options) {
            const eventHandlers = events.getHandlers(eventKey);
            if (eventHandlers.length) {
                eventHandlers.forEach((eventHandler) => eventHandler(options));
            }
        }
    };

    const registers = {
        registerHandler (type, typeKey, typeHandler) {
            switch (type) {
            case 'request':
                requests.new(typeKey, typeHandler);
                break;
            case 'command':
                commands.new(typeKey, typeHandler);
                break;
            case 'event':
                events.new(typeKey, typeHandler);
                break;
            }
        },

        registerRequestHandlers (requestHandlers={}) {
            Object.keys(requestHandlers).forEach((requestKey) => {
                let requestHandler = requestHandlers[requestKey];
                registers.registerHandler('request', requestKey, requestHandler);
            });
        },

        registerCommandHandlers (commandHandlers={}) {
            Object.keys(commandHandlers).forEach((commandKey) => {
                let commandHandler = commandHandlers[commandKey];
                registers.registerHandler('command', commandKey, commandHandler);
            });
        },

        registerEventHandlers (eventHandlers={}) {
            Object.keys(eventHandlers).forEach((eventKey) => {
                let eventHandler = eventHandlers[eventKey];
                registers.registerHandler('event', eventKey, eventHandler);
            });
        }
    };

    const fn = {
        init () {
            if (internal.parent) {
                internal.parent.registerChild(api);
            }
        },

        shouldConceal (msgKey) {
            let shouldConceal = false;

            internal.conceal.forEach((concealPattern) => {
                shouldConceal = shouldConceal || concealPattern.test(msgKey);
            });

            return shouldConceal;
        },

        delegate (type, msgKey, args={}, opts={}) {
            const { _state } = opts;

            if (!_state.hasAttempted(internal.id)) {
                fn.handle(type, msgKey, args, opts);
            }

            if (!_state.hasBeenHandled) {
                internal.children.forEach((childMediator) => {
                    if (
                        !_state.hasBeenHandled &&
                        !_state.hasAttempted(childMediator.getId())
                    ) {
                        childMediator.handle(type, msgKey, args, opts);
                    }
                });
            }

            if (!_state.hasBeenHandled) {
                if (
                    internal.parent &&
                    !_state.hasAttempted(internal.parent.getId()) &&
                    !fn.shouldConceal(msgKey)
                ) {
                    internal.parent.delegate(type, msgKey, args, opts);
                }
            }

            return _state.response;
        },

        canHandle (type, msgKey) {
            switch (type) {
            case 'request':
                return requests.canHandle(msgKey);
            case 'command':
                return commands.canHandle(msgKey);
            case 'event':
                return events.canHandle(msgKey);
            }
        },

        handle (type, msgKey, args={}, opts={}) {
            opts._state = opts._state || fn.newStateObj();

            const canHandle = fn.canHandle(type, msgKey);
            const { _state } = opts;

            if (_state.hasAttempted(internal.id)) {
                return _state.response;
            }

            opts._state.logAttempt(internal.id);
            if (canHandle) {
                switch (type) {
                case 'request':
                    _state.response = requests.request(msgKey, args);
                    _state.hasBeenHandled = true;
                    break;
                case 'command':
                    commands.exec(msgKey, args);
                    _state.hasBeenHandled = true;
                    break;
                case 'event':
                    events.emit(msgKey, args);
                    fn.delegate(type, msgKey, args, opts);
                    break;
                }

                return _state.response;
            } else {
                return fn.delegate(type, msgKey, args, opts);
            }
        },

        newStateObj () {
            const stateObj = {
                attempts: [],
                hasBeenHandled: false,
                response: null,
                logAttempt (mediatorId) {
                    this.attempts.push(mediatorId);
                },
                hasAttempted (mediatorId) {
                    return this.attempts.indexOf(mediatorId) > -1;
                }
            };

            return stateObj;
        },

        request (requestKey, opts={}) {
            return fn.handle('request', requestKey, opts);
        },

        exec (commandKey, opts={}) {
            fn.handle('command', commandKey, opts);
        },

        emit (eventKey, opts={}) {
            fn.handle('event', eventKey, opts);
        },

        hasAttemptedToHandle (opts) {
            return opts.attemptedDelegates.indexOf(internal.id) > -1;
        },

        registerChild (childApi) {
            childApi.childIndex = internal.children.length;
            internal.children.push(childApi);
        },

        deregisterChild (childApi) {
            internal.children.slice(childApi.childIndex, 1);
        },

        setParent (parentApi) {
            if (internal.parent) {
                internal.parent.deregisterChild(api);
            }

            internal.parent = parentApi;
            internal.parent.registerChild(api);
        },

        getId () {
            return internal.id;
        }
    };

    const api = {
        getId: fn.getId,
        registerRequestHandlers: registers.registerRequestHandlers,
        registerCommandHandlers: registers.registerCommandHandlers,
        registerEventHandlers: registers.registerEventHandlers,
        registerHandler: registers.registerHandler,
        request: fn.request,
        exec: fn.exec,
        emit: fn.emit,
        get: fn.request,
        canHandle: fn.canHandle,
        handle: fn.handle,
        registerChild: fn.registerChild,
        hasAttemptedToHandle: fn.hasAttemptedToHandle,
        deregisterChild: fn.deregisterChild,
        setParent: fn.setParent,
        delegate: fn.delegate,
        getHandlerKeys: function () {
            let handlers = [];

            handlers.concat(Object.keys(requests.handlers));
            handlers.concat(Object.keys(commands.handlers));
            handlers.concat(Object.keys(events.handlers));

            return handlers;
        }
    };

    fn.init();

    return api;
};

export default Mediator;
