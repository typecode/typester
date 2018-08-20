// jshint strict: false
/**
 * Mediator - The glue that holds the entire app together. Nothing can cross
 * communicate without going through the mediator.
 *
 * There are 3 kinds of messages: Commands, Requests, Events.
 *
 * Commands - One-to-one message with no response.
 * Requests - One-to-one message with a response.
 * Events - One-to-many message with no response.
 *
 * @access protected
 * @module core/Mediator
 *
 * @requires utils/guid
 *
 * @example
 * const mediator = new Mediator({
 *   parent: someOtherMediator,
 *   conceal: [/modulename:.*?/]
 * });
 *
 * mediator.getId() // Returns the uid of the mediator
 *
 * // Register handlers
 * mediator.registerRequestHandlers({ 'handler:call:string': function handler (opts) {} })
 * mediator.registerCommandHandlers({ 'handler:call:string': function handler (opts) {} })
 * mediator.registerEventHandlers({ 'event:emit:string': function handler (opts) {} })
 * // registerHandler(type, handlerCallString, handlerFunction)
 * mediator.registerHandler('request', 'handler:call:string', function handler (opts) {} )
 *
 * // Call a request handler
 * mediator.request('handler:call:string', opts) // opts will be passed on to the handler
 * mediator.get('handler:call:string', opts)
 *
 * // Call a command handler
 * mediator.exec('handler:call:string', opts) // opts will be passed on to the handler
 *
 * // Emit an event and trigger an event handler
 * mediator.emit('event:emit:string', opts) // opts will be passed on to the handler
 *
 * // Check if a handler has been registered and a call string or emit string can be handled
 * mediator.canHandle('some:other:call:string') // --> true / false
 *
 * // Handle a call string or emit string message by type
 * mediator.handle('request', 'request:call:string', args, opts) // args will be passed along to the handle, opts allows for call specific options
 *
 * // Register a child mediator
 * mediator.registerChild(mediator)
 *
 * // Deregister a child mediator
 * mediator.deregisterChild(mediator)
 *
 * // Set the parent for the mediator
 * mediator.setParent(mediator)
 *
 * // Delegate a command, request, or event to either child mediators or parents.
 * mediator.delegate('command', 'command:call:string', args, opts) // args will be passed along to the handle, opts allows for call specific options
 *
 */

import guid from '../utils/guid';

/**
 * @constructor
 * @param {object} opts - Mediator options
 * @param {mediator} opts.parent - A parent mediator to delegate to if necessary
 * @param {Array<RegExp>} opts.conceal - An array of regular expressions to test the request, command and event keys against to determine whether they should get delegated if unhandled
 */
const Mediator = function (opts={}) {

    /**
     * @prop {object} internal - The internal options and state object of the mediator instance
     * @access protected
     */
    const internal = {
        parent: opts.parent,
        children: [],
        id: guid(),
        conceal: opts.conceal || []
    };

    /**
     * @prop {object} requests
     * @namespace
     * @desc The requests object that stores requests and offers methods to interact with them
     * @access protected
     */
    const requests = {

        /**
         * @prop {object} handlers - An enumerable object store of regitered request key/handler pairs.
         */
        handlers: {},

        /**
         * @func new
         * @desc register a new request key/handler pair. Check if an existing handler is present for the key and throw and error if there is
         * @param  {string} requestKey     the key/call string for the handler. e.g. modulename:get:value
         * @param  {function} requestHandler the handler method to be called
         * @return {any}                the response from the handler method
         */
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
        },

        destroy () {
            requests.handlers = {};
        }
    };

    /**
     * @private
     */
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
        },

        destroy () {
            commands.handlers = {};
        }
    };

    /**
     * @private
     */
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

            if (eventKey === 'app:destroy') {
                fn.destroy();
            }
        },

        destroy () {
            events.handlers = {};
        }
    };

    /**
     * @private
     */
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

    /**
     * @private
     */
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

        // NB: Seems like this isn't actually being used.
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
        },

        destroy () {
            requests.destroy();
            commands.destroy();
            events.destroy();
        }
    };

    /**
     * @public
     */
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

        // NB this also doesn't seem to be used anywhere.
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
