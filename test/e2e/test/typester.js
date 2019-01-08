(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Typester = factory());
}(this, (function () { 'use strict';

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

    Array.prototype.forEach = function (callback /*, thisArg*/) {

        var T, k;

        if (this == null) {
            throw new TypeError('this is null or not defined');
        }

        // 1. Let O be the result of calling toObject() passing the
        // |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get() internal
        // method of O with the argument "length".
        // 3. Let len be toUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If isCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let
        // T be undefined.
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // 6. Let k be 0
        k = 0;

        // 7. Repeat, while k < len
        while (k < len) {

            var kValue;

            // a. Let Pk be ToString(k).
            //    This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty
            //    internal method of O with argument Pk.
            //    This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal
                // method of O with argument Pk.
                kValue = O[k];

                // ii. Call the Call internal method of callback with T as
                // the this value and argument list containing kValue, k, and O.
                callback.call(T, kValue, k, O);
            }
            // d. Increase k by 1.
            k++;
        }
        // 8. return undefined
    };
}

if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}

if (typeof Object.assign !== 'function') {
    Object.assign = function (target) {
        // .length of function is 2
        'use strict';

        var to, index, nextSource, nextKey;

        if (target === null) {
            // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }

        to = Object(target);

        for (index = 1; index < arguments.length; index++) {
            nextSource = arguments[index];

            if (nextSource !== null) {
                // Skip over if undefined or null
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

// jshint strict: false

/**
* @access protected
*/
var guid = function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

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

/**
 * @constructor
 * @param {object} opts - Mediator options
 * @param {mediator} opts.parent - A parent mediator to delegate to if necessary
 * @param {Array<RegExp>} opts.conceal - An array of regular expressions to test the request, command and event keys against to determine whether they should get delegated if unhandled
 */
var Mediator = function Mediator() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


    /**
     * @prop {object} internal - The internal options and state object of the mediator instance
     * @access protected
     */
    var internal = {
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
    var requests = {

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
        new: function _new(requestKey, requestHandler) {
            if (requests.handlers[requestKey]) {
                throw new Error('Only one requestHandler per requestKey: ' + requestKey);
            }

            requests.handlers[requestKey] = requestHandler;
        },
        getHandler: function getHandler(requestKey) {
            return requests.handlers[requestKey];
        },
        canHandle: function canHandle(requestKey) {
            return !!requests.getHandler(requestKey);
        },
        request: function request(requestKey, options) {
            var requestHandler = requests.getHandler(requestKey);

            if (requestHandler) {
                return requestHandler(options);
            }
        }
    };

    /**
     * @private
     */
    var commands = {
        handlers: {},

        new: function _new(commandKey, commandHandler) {
            if (commands.handlers[commandKey]) {
                throw new Error('Only one commandHandler per commandKey: ' + commandKey);
            }

            commands.handlers[commandKey] = commandHandler;
        },
        getHandler: function getHandler(commandKey) {
            return commands.handlers[commandKey];
        },
        canHandle: function canHandle(commandKey) {
            return !!commands.getHandler(commandKey);
        },
        exec: function exec(commandKey, options) {
            var commandHandler = commands.getHandler(commandKey);
            if (commandHandler) {
                commandHandler(options);
            }
        }
    };

    /**
     * @private
     */
    var events = {
        handlers: {},

        new: function _new(eventKey, eventHandler) {
            events.handlers[eventKey] = events.handlers[eventKey] || [];
            events.handlers[eventKey].push(eventHandler);
        },
        getHandlers: function getHandlers(eventKey) {
            return events.handlers[eventKey] || [];
        },
        canHandle: function canHandle(eventKey) {
            return !!events.getHandlers(eventKey);
        },
        emit: function emit(eventKey, options) {
            var eventHandlers = events.getHandlers(eventKey);
            if (eventHandlers.length) {
                eventHandlers.forEach(function (eventHandler) {
                    return eventHandler(options);
                });
            }
        }
    };

    /**
     * @private
     */
    var registers = {
        registerHandler: function registerHandler(type, typeKey, typeHandler) {
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
        registerRequestHandlers: function registerRequestHandlers() {
            var requestHandlers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            Object.keys(requestHandlers).forEach(function (requestKey) {
                var requestHandler = requestHandlers[requestKey];
                registers.registerHandler('request', requestKey, requestHandler);
            });
        },
        registerCommandHandlers: function registerCommandHandlers() {
            var commandHandlers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            Object.keys(commandHandlers).forEach(function (commandKey) {
                var commandHandler = commandHandlers[commandKey];
                registers.registerHandler('command', commandKey, commandHandler);
            });
        },
        registerEventHandlers: function registerEventHandlers() {
            var eventHandlers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            Object.keys(eventHandlers).forEach(function (eventKey) {
                var eventHandler = eventHandlers[eventKey];
                registers.registerHandler('event', eventKey, eventHandler);
            });
        }
    };

    /**
     * @private
     */
    var fn = {
        init: function init() {
            if (internal.parent) {
                internal.parent.registerChild(api);
            }
        },
        shouldConceal: function shouldConceal(msgKey) {
            var shouldConceal = false;

            internal.conceal.forEach(function (concealPattern) {
                shouldConceal = shouldConceal || concealPattern.test(msgKey);
            });

            return shouldConceal;
        },
        delegate: function delegate(type, msgKey) {
            var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var _state = opts._state;


            if (!_state.hasAttempted(internal.id)) {
                fn.handle(type, msgKey, args, opts);
            }

            if (!_state.hasBeenHandled) {
                internal.children.forEach(function (childMediator) {
                    if (!_state.hasBeenHandled && !_state.hasAttempted(childMediator.getId())) {
                        childMediator.handle(type, msgKey, args, opts);
                    }
                });
            }

            if (!_state.hasBeenHandled) {
                if (internal.parent && !_state.hasAttempted(internal.parent.getId()) && !fn.shouldConceal(msgKey)) {
                    internal.parent.delegate(type, msgKey, args, opts);
                }
            }

            return _state.response;
        },
        canHandle: function canHandle(type, msgKey) {
            switch (type) {
                case 'request':
                    return requests.canHandle(msgKey);
                case 'command':
                    return commands.canHandle(msgKey);
                case 'event':
                    return events.canHandle(msgKey);
            }
        },
        handle: function handle(type, msgKey) {
            var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            opts._state = opts._state || fn.newStateObj();

            var canHandle = fn.canHandle(type, msgKey);
            var _state = opts._state;


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
        newStateObj: function newStateObj() {
            var stateObj = {
                attempts: [],
                hasBeenHandled: false,
                response: null,
                logAttempt: function logAttempt(mediatorId) {
                    this.attempts.push(mediatorId);
                },
                hasAttempted: function hasAttempted(mediatorId) {
                    return this.attempts.indexOf(mediatorId) > -1;
                }
            };

            return stateObj;
        },
        request: function request(requestKey) {
            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return fn.handle('request', requestKey, opts);
        },
        exec: function exec(commandKey) {
            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            fn.handle('command', commandKey, opts);
        },
        emit: function emit(eventKey) {
            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            fn.handle('event', eventKey, opts);
        },


        // NB: Seems like this isn't actually being used.
        hasAttemptedToHandle: function hasAttemptedToHandle(opts) {
            return opts.attemptedDelegates.indexOf(internal.id) > -1;
        },
        registerChild: function registerChild(childApi) {
            childApi.childIndex = internal.children.length;
            internal.children.push(childApi);
        },
        deregisterChild: function deregisterChild(childApi) {
            internal.children.slice(childApi.childIndex, 1);
        },
        setParent: function setParent(parentApi) {
            if (internal.parent) {
                internal.parent.deregisterChild(api);
            }

            internal.parent = parentApi;
            internal.parent.registerChild(api);
        },
        getId: function getId() {
            return internal.id;
        }
    };

    /**
     * @public
     */
    var api = {
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
        getHandlerKeys: function getHandlerKeys() {
            var handlers = [];

            handlers.concat(Object.keys(requests.handlers));
            handlers.concat(Object.keys(commands.handlers));
            handlers.concat(Object.keys(events.handlers));

            return handlers;
        }
    };

    fn.init();

    return api;
};

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
var Context = function Context() {
    this.mixin.apply(this, arguments);
};

Object.assign(Context.prototype, {
    /**
     * mixin - accepts additional contexts to mixin into itself
     * @param  {Array<Object>} ...contexts description
     */
    mixin: function mixin() {
        var _this = this;

        for (var _len = arguments.length, contexts = Array(_len), _key = 0; _key < _len; _key++) {
            contexts[_key] = arguments[_key];
        }

        contexts.forEach(function (context) {
            Object.assign(_this, context);
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
    extendWith: function extendWith(mixinContext) {
        var _this2 = this;

        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (opts.keys) {
            opts.keys.forEach(function (key) {
                _this2[key] = mixinContext[key];
            });
        } else {
            this.mixin(mixinContext);
        }
    }
});

// jshint strict: false

/**
* @access protected
*/
var func = {
    bind: function bind(func, context) {
        return function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return func.apply(context, args);
        };
    },
    bindObj: function bindObj(funcObj, context) {
        var boundFuncObj = {};

        Object.keys(funcObj).forEach(function (funcKey) {
            boundFuncObj[funcKey] = func.bind(funcObj[funcKey], context);
        });

        return boundFuncObj;
    }
};

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

var Container = function Container(containerObj) {
    var containerName = containerObj.name,
        containerHandlers = containerObj.handlers,
        containerMethods = containerObj.methods,
        containerModules = containerObj.modules,
        containerChildContainers = containerObj.containers,
        mediatorOpts = containerObj.mediatorOpts;


    if (!containerName) {
        throw new Error('No name given for container');
    }

    var containerUtils = {
        createContext: function createContext() {
            for (var _len = arguments.length, contexts = Array(_len), _key = 0; _key < _len; _key++) {
                contexts[_key] = arguments[_key];
            }

            return new (Function.prototype.bind.apply(Context, [null].concat(contexts)))();
        },
        bindMethods: function bindMethods(methods, context) {
            methods = methods || {};
            return func.bindObj(methods, context);
        },
        initModules: function initModules() {
            var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            modules.forEach(function (module) {
                var moduleOpts = Object.assign({}, opts, module.opts || {});
                module.instance = new module.class(moduleOpts);
            });
        },
        initChildContainers: function initChildContainers() {
            var childContainers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            childContainers.forEach(function (containerObj) {
                var containerOpts = Object.assign({}, opts, containerObj.opts || {});
                containerObj.instance = new containerObj.class(containerOpts);
            });
        },
        registerHandlers: function registerHandlers(mediator, handlers, context) {
            Object.keys(handlers).forEach(function (handlerKey) {
                var handlerMap = handlers[handlerKey];
                var handlerMethods = containerUtils.getHandlerMethods(handlerMap, context);

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
        getHandlerMethods: function getHandlerMethods(handlerMap, context) {
            var routedHandlers = {};

            Object.keys(handlerMap).forEach(function (commandStr) {
                var methodKey = handlerMap[commandStr];
                var handlerMethod = context[methodKey];
                routedHandlers[commandStr] = handlerMethod;
            });

            return routedHandlers;
        }
    };

    var containerProto = {
        containerConstructor: function containerConstructor() {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var context = containerUtils.createContext();
            var boundMethods = containerUtils.bindMethods(containerMethods, context);
            context.extendWith(boundMethods);
            var mediator = new Mediator(Object.assign({ parent: opts.mediator }, mediatorOpts));
            context.extendWith({ mediator: mediator });

            if (containerHandlers) {
                containerUtils.registerHandlers(mediator, containerHandlers, context);
            }

            if (boundMethods.setup) {
                boundMethods.setup();
            }

            containerUtils.initModules(containerModules, {
                dom: opts.dom,
                mediator: mediator
            });

            containerUtils.initChildContainers(containerChildContainers, {
                dom: opts.dom,
                mediator: mediator
            });

            if (boundMethods.init) {
                boundMethods.init();
            }

            return {
                setMediatorParent: function setMediatorParent(parentMediator) {
                    mediator.setParent(parentMediator);
                }
            };
        }
    };

    return containerProto.containerConstructor;
};

// jshint strict: false

/**
* @access protected
*/
var browser = {
    // From https://codepen.io/gapcode/pen/vEJNZN
    ieVersion: function ieVersion() {
        var ua = window.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    },
    isIE: function isIE() {
        var ieVersion = browser.ieVersion();
        return ieVersion && ieVersion < 12;
    },
    isFirefox: function isFirefox() {
        return window.navigator.userAgent.indexOf('Firefox') > -1;
    }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();



































var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

// jshint strict: false
/* eslint-disable no-alert, no-console */

/**
* @access protected
*/
var DOM = {
    regex: {
        getById: /^#/,
        getByClassName: /^\./,
        getByTag: /^[a-z]/
    },

    getElements: function getElements(elementsObj, rootEl) {
        for (var elementKey in elementsObj) {
            if (elementsObj.hasOwnProperty(elementKey) && elementKey !== 'rootEl') {
                var elementObj = elementsObj[elementKey];
                var selector = elementObj.selector;


                rootEl = elementObj.rootEl || rootEl;
                rootEl = typeof rootEl === 'function' ? rootEl() : rootEl;

                elementObj.el = DOM.get(selector, rootEl);
            }
        }
    },


    // Public methods
    get: function get$$1(selector) {
        var domRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

        if (DOM.isElement(selector)) {
            return [selector];
        }
        var getMethodName = DOM._getGetMethodName(selector);
        return DOM[getMethodName](selector, domRoot);
    },
    getByClassName: function getByClassName(className) {
        var domRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

        className = DOM._cleanSelector(className);
        return domRoot.getElementsByClassName(className);
    },
    getByTag: function getByTag(tag) {
        var domRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

        tag = DOM._cleanSelector(tag);
        return domRoot.getElementsByTagName(tag);
    },
    getById: function getById(id) {
        return document.getElementById(id);
    },
    getClosest: function getClosest(node, selector, ceilNode) {
        var rootEl = ceilNode || DOM.getRootEl();
        var checkType = /^\[/.test(selector) ? 'attribute' : /^\./.test(selector) ? 'class' : /^\#/.test(selector) ? 'id' : 'tag';

        var returnNode = false;
        var attrName = void 0,
            className = void 0,
            idStr = void 0,
            parentId = void 0;

        if (node === rootEl) {
            return null;
        }

        while (node.nodeType !== Node.ELEMENT_NODE) {
            node = node.parentNode;
        }

        switch (checkType) {
            case 'attribute':
                attrName = selector.match(/\[(.*?)\]/)[1];
                returnNode = node.hasAttribute(attrName);
                break;
            case 'class':
                className = selector.replace('.', '');
                returnNode = node.classList && node.classList.contains(className);
                break;
            case 'id':
                idStr = selector.replace('#', '');
                parentId = node.getAttribute('id');
                returnNode = idStr === parentId;
                break;
            case 'tag':
                returnNode = node.nodeName.toLowerCase() === selector.toLowerCase();
                break;
        }

        if (returnNode) {
            return node;
        } else {
            return DOM.getClosest(node.parentNode, selector, rootEl);
        }
    },
    getClosestInArray: function getClosestInArray(node, nameArray, ceilNode) {
        var parentNode = node;

        while (nameArray.indexOf(parentNode.nodeName) < 0 && parentNode !== ceilNode) {
            parentNode = parentNode.parentNode;
        }

        if (parentNode !== ceilNode) {
            return parentNode;
        } else {
            return null;
        }
    },
    getFurthest: function getFurthest(node, selector) {
        var rootEl = DOM.getRootEl();
        var currentNode = node;
        var furthest = null;

        selector = selector instanceof Array ? selector : [selector];

        while (currentNode && currentNode !== rootEl) {
            if (selector.indexOf(currentNode.nodeName) > -1) {
                furthest = currentNode;
            }
            currentNode = currentNode.parentNode || currentNode.parentElement;
        }

        return furthest;
    },
    nextNode: function nextNode(node) {
        if (node.hasChildNodes()) {
            return node.firstChild;
        } else {
            while (node && !node.nextSibling) {
                node = node.parentNode;
            }
            if (!node) {
                return null;
            }
            return node.nextSibling;
        }
    },
    appendTo: function appendTo(selector, tag) {
        var htmlNode = DOM.isElement(tag) ? tag : document.createElement(tag);
        var targetEl = DOM.get(selector);

        for (var i = 0; i < targetEl.length; i++) {
            targetEl[i].appendChild(htmlNode);
        }

        return htmlNode;
    },
    addStyles: function addStyles(styles) {
        var styleEl = DOM.appendTo('head', 'style');

        styleEl.setAttribute('id', 'typester-styles');
        styleEl.setAttribute('type', 'text/css');

        if (styleEl.styleSheet) {
            styleEl.styleSheet.cssText = styles;
        } else {
            styleEl.appendChild(document.createTextNode(styles));
        }

        return styleEl;
    },


    // From http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    isNode: function isNode(o) {
        return (typeof Node === 'undefined' ? 'undefined' : _typeof(Node)) === 'object' ? o instanceof Node : o && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && typeof o.nodeType === 'number' && typeof o.nodeName === 'string';
    },
    isElement: function isElement(elem) {
        var isElement = false;

        isElement = elem instanceof Window || elem instanceof Document;
        isElement = isElement || (typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === 'object' && elem instanceof HTMLElement;
        isElement = isElement || elem && (typeof elem === 'undefined' ? 'undefined' : _typeof(elem)) === 'object' && elem !== null && elem.nodeType === 1 && typeof elem.nodeName === 'string';

        return isElement;
    },
    isIn: function isIn(node, nodeName, ceilNode) {
        var isIn = false;
        var currentNode = node;
        var nameArray = nodeName instanceof Array ? nodeName : nodeName.split('/');

        ceilNode = ceilNode || DOM.getRootEl();
        nameArray = nameArray.map(function (name) {
            return name.toLowerCase();
        });

        while (!isIn && currentNode !== ceilNode) {
            isIn = nameArray.indexOf(currentNode.nodeName.toLowerCase()) > -1;
            currentNode = currentNode.parentNode;
        }

        return isIn;
    },
    isChildOf: function isChildOf(childNode, parentNode) {
        if (childNode instanceof Array) {
            childNode = childNode[0];
        }

        if (parentNode instanceof Array) {
            parentNode = parentNode[0];
        }

        return parentNode && childNode && parentNode.contains(childNode);
    },
    addClass: function addClass(el, classStr) {
        el.classList.add(classStr);
    },
    toggleClass: function toggleClass(el, classStr, force) {
        var addClass = force !== undefined ? force : !el.classList.contains(classStr);

        if (addClass) {
            DOM.addClass(el, classStr);
        } else {
            DOM.removeClass(el, classStr);
        }
    },
    removeClass: function removeClass(el, classStr) {
        el.classList.remove(classStr);
    },
    isBlock: function isBlock(node) {
        return DOM.getStyle(node, 'display') === 'block';
    },
    closestElement: function closestElement(node) {
        var returnNode = node;

        while (returnNode.nodeType !== 1) {
            returnNode = returnNode.parentNode;
        }

        return returnNode;
    },
    getStyles: function getStyles(node) {
        var closestElement = DOM.closestElement(node);
        var gcs = 'getComputedStyle' in window;
        return gcs ? window.getComputedStyle(closestElement) : closestElement.currentStyle;
    },
    getStyle: function getStyle(node, property) {
        var nodeStyles = DOM.getStyles(node);
        return nodeStyles[property];
    },
    insertBefore: function insertBefore(newNode, referenceNode) {
        var parentNode = referenceNode.parentNode;
        parentNode.insertBefore(newNode, referenceNode);
    },
    insertAfter: function insertAfter(newNode, referenceNode) {
        var parentNode = referenceNode.parentNode;

        if (parentNode.lastChild === referenceNode) {
            parentNode.appendChild(newNode);
        } else {
            parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }
    },
    isLastChild: function isLastChild(node) {
        return node === node.parentNode.lastChild;
    },
    isFirstChild: function isFirstChild(node) {
        return node === node.parentNode.firstChild;
    },
    wrapRange: function wrapRange(nodeName, nodeOpts) {
        var sel = window.getSelection();
        var range = sel.getRangeAt(0);
        var wrapper = document.createElement(nodeName);

        for (var optKey in nodeOpts) {
            if (nodeOpts.hasOwnProperty(optKey)) {
                wrapper[optKey] = nodeOpts[optKey];
            }
        }

        range.surroundContents(wrapper);

        return wrapper;
    },
    unwrap: function unwrap(node) {
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var unwrappedNodes = [];

        if (node.childNodes) {
            while (node.firstChild) {
                unwrappedNodes.push(node.firstChild);
                DOM.insertBefore(node.firstChild, node);
            }
        }

        if (!opts.keepNode) {
            DOM.removeNode(node);
        }
        return unwrappedNodes;
    },
    unwrapFrom: function unwrapFrom(node, wrappers) {
        var rootEl = DOM.getRootEl();
        var currentNode = node;
        var unwrappedNodes = [currentNode];

        while (currentNode !== rootEl) {
            var parentNode = currentNode.parentNode || currentNode.parentElement;

            if (wrappers.indexOf(currentNode.nodeName) > -1) {
                unwrappedNodes = DOM.unwrap(currentNode);
            }

            currentNode = parentNode;
        }

        return unwrappedNodes;
    },
    unwrapToRoot: function unwrapToRoot(node) {
        var rootEl = DOM.getRootEl();
        var currentNode = node.parentNode;

        while (currentNode !== rootEl) {
            var parentNode = currentNode.parentNode;
            DOM.unwrap(currentNode);
            currentNode = parentNode;
        }
    },
    removeNode: function removeNode(node) {
        var parentNode = node.parentElement || node.parentNode;
        if (parentNode) {
            parentNode.removeChild(node);
        }
    },
    replaceNode: function replaceNode(node, newNode) {
        var parentNode = node.parentNode || node.parentElement;
        if (parentNode) {
            parentNode.replaceChild(newNode, node);
        }
    },
    getContainerZIndex: function getContainerZIndex(node) {
        var container = node;
        var topMostContainerZIndex = 0;

        while (container && container !== document.body) {
            var containerZIndex = window.getComputedStyle(container).zIndex;
            if (/^[0-9]+$/.test(containerZIndex)) {
                topMostContainerZIndex = parseInt(containerZIndex);
            }
            container = container.parentNode;
        }

        return topMostContainerZIndex;
    },


    // // From http://stackoverflow.com/questions/6139107/programmatically-select-text-in-a-contenteditable-html-element
    // selectNodeContents(node) {
    //     node = node || DOM.getAnchorNode();
    //     if (!node) {
    //         return;
    //     }
    //
    //     const nodes = node instanceof Array ? node : [node];
    //     const startNode = nodes[0];
    //     const endNode = nodes[nodes.length - 1];
    //
    //     const range = document.createRange();
    //     range.setStart(startNode, 0);
    //     range.setEnd(endNode, endNode.length);
    //
    //     const sel = window.getSelection();
    //     if (sel.rangeCount > 0) {
    //         sel.removeAllRanges();
    //     }
    //     sel.addRange(range);
    // },

    getRootEl: function getRootEl() {
        var selection = document.getSelection();
        var anchorNode = selection.anchorNode;

        var rootEl = anchorNode;
        while (rootEl && !(rootEl.nodeType === Node.ELEMENT_NODE && rootEl.hasAttribute('contenteditable'))) {
            rootEl = rootEl.parentNode;
        }

        return rootEl;
    },
    removeInvalidTagsUpward: function removeInvalidTagsUpward(node, acceptedTags) {
        var rootEl = DOM.getRootEl();
        var currentNode = node;
        var invalidTags = [];
        var unwrappedNodes = [node];

        while (currentNode !== rootEl) {
            if (currentNode.nodeType === 1 && acceptedTags.indexOf(currentNode.nodeName) < 0) {
                invalidTags.push(currentNode);
            }
            currentNode = currentNode.parentNode || currentNode.parentElement;
        }

        for (var i = 0; i < invalidTags.length; i++) {
            var invalidTag = invalidTags[i];
            unwrappedNodes = DOM.unwrap(invalidTag);
        }

        return unwrappedNodes;
    },


    // From: http://stackoverflow.com/questions/37025488/remove-whitespace-from-window-selection-in-js
    trimSelection: function trimSelection(opts) {
        opts = opts || { fromEnd: true };

        var sel = window.getSelection();
        var range = sel.getRangeAt(0);
        var selStr = sel.toString();

        var regEx = void 0,
            container = void 0,
            method = void 0,
            regExResult = void 0,
            offset = range.startOffset,
            rangeClone = void 0;

        if (opts.bothEnds) {
            opts.fromEnd = true;
        }

        if (opts.fromEnd) {
            regEx = /\s+$/;
            container = range.endContainer;
            method = range.setEnd;
        } else if (opts.fromStart) {
            regEx = /[^\s]/;
            container = range.startContainer;
            method = range.setStart;
        }

        regExResult = regEx.exec(selStr);
        if (regExResult && regExResult.index > 0) {
            if (opts.fromEnd && offset + regExResult.index > container.length) {
                regExResult = regEx.exec(container.textContent);
                if (regExResult) {
                    method.call(range, container, regExResult.index);
                }
            } else {
                method.call(range, container, offset + regExResult.index);
            }

            rangeClone = range.cloneRange();
            sel.removeAllRanges();
            sel.addRange(rangeClone);
        }

        if (opts.bothEnds) {
            if (opts.fromEnd) {
                DOM.trimSelection({ fromStart: true });
            } else {
                DOM.trimSelection({ fromEnd: true });
            }
        }
    },
    createPseudoSelect: function createPseudoSelect() {
        var rootEl = DOM.getRootEl();
        var wrapper = DOM.wrapRange('SPAN', {
            className: 'pseudo-selection'
        });
        var selectionStyles = void 0;

        if (browser.isFirefox()) {
            selectionStyles = window.getComputedStyle(rootEl, '::-moz-selection');
        } else {
            selectionStyles = window.getComputedStyle(rootEl, '::selection');
        }

        wrapper.style['background-color'] = selectionStyles['background-color'];
        if (wrapper.style['background-color'] === 'transparent') {
            wrapper.style['background-color'] = '#EEEEEE';
        }
        wrapper.style.color = selectionStyles.color;

        return wrapper;
    },


    // From: https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
    getScrollOffset: function getScrollOffset() {
        var supportPageOffset = window.pageXOffset !== undefined;
        var isCSS1Compat = (document.compatMode || '') === 'CSS1Compat';

        var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
        var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

        return { x: x, y: y };
    },
    childIndex: function childIndex(node) {
        var child = node;
        var childIndex = 0;

        while ((child = child.previousSibling) !== null) {
            childIndex++;
        }

        return childIndex;
    },


    //Pseudo-private methods
    _getGetMethodName: function _getGetMethodName(selector) {
        var methodName = null;

        Object.keys(DOM.regex).forEach(function (regexKey) {
            var regex = DOM.regex[regexKey];
            if (regex.test(selector)) {
                methodName = regexKey;
            }
        });

        return methodName;
    },
    _cleanSelector: function _cleanSelector(selector) {
        return selector.replace(/^[\.#]/, '');
    },
    _createEl: function _createEl(tag) {
        return document.createElement(tag);
    }
};

// jshint strict: false

/**
* @access protected
*/
var Module = function Module(moduleObj) {
    var moduleName = moduleObj.name,
        moduleProps = moduleObj.props,
        moduleHandlers = moduleObj.handlers,
        moduleDom = moduleObj.dom,
        moduleMethods = moduleObj.methods,
        moduleRequiredProps = moduleObj.requiredProps;


    if (!moduleName) {
        throw new Error('No name given for module', moduleObj);
    }

    var moduleUtils = {
        createContext: function createContext() {
            for (var _len = arguments.length, contexts = Array(_len), _key = 0; _key < _len; _key++) {
                contexts[_key] = arguments[_key];
            }

            return new (Function.prototype.bind.apply(Context, [null].concat(contexts)))();
        },
        bindMethods: function bindMethods(methods, context) {
            methods = methods || {};
            return func.bindObj(methods, context);
        },
        wrapRenderMethod: function wrapRenderMethod(renderMethod, opts) {
            var wrappedRenderMethod = function wrappedRenderMethod() {
                var context = opts.context;

                var mergedDom = void 0;

                mergedDom = moduleUtils.mergeDom(moduleDom, opts.dom);
                mergedDom.el = renderMethod.apply(undefined, arguments);

                moduleUtils.getDom(mergedDom);
                context.extendWith({ dom: mergedDom });

                if (moduleHandlers.domEvents) {
                    moduleUtils.registerDomHandlers(moduleHandlers.domEvents, context);
                }
            };
            return wrappedRenderMethod;
        },
        registerHandlers: function registerHandlers(mediator, handlers, context) {
            Object.keys(handlers).forEach(function (handlerKey) {
                var handlerMap = handlers[handlerKey];
                var handlerMethods = moduleUtils.getHandlerMethods(handlerMap, context);
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
        registerDomHandlers: function registerDomHandlers(domHandlersMap, context) {
            var handlerMethods = moduleUtils.getHandlerMethods(domHandlersMap, context);
            moduleUtils.bindDomEvents(handlerMethods, context);
        },
        getHandlerMethods: function getHandlerMethods(handlerMap, context) {
            var routedHandlers = {};

            Object.keys(handlerMap).forEach(function (commandStr) {
                var methodKey = handlerMap[commandStr];
                var handlerMethod = context[methodKey];
                routedHandlers[commandStr] = handlerMethod;
            });

            return routedHandlers;
        },
        mergeDom: function mergeDom(defaultDom) {
            var dom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var mergedDom = {};
            Object.keys(defaultDom).forEach(function (domKey) {
                mergedDom[domKey] = defaultDom[domKey];
            });

            Object.keys(dom).forEach(function (domKey) {
                mergedDom[domKey] = dom[domKey];
                mergedDom[domKey].selector = dom[domKey];
            });

            return mergedDom;
        },
        getDom: function getDom(dom) {
            var rootEl = dom.el || document.body;
            Object.keys(dom).forEach(function (domKey) {
                var selector = void 0,
                    domEl = void 0;

                selector = dom[domKey];
                if (selector === null) {
                    return;
                } else if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) === 'object') {
                    selector = selector.selector || selector;
                }

                domEl = DOM.get(selector, rootEl);
                domEl.selector = selector;

                dom[domKey] = domEl;
            });
        },
        bindDomEvents: function bindDomEvents(handlers, context) {
            var dom = context.dom;


            Object.keys(handlers).forEach(function (eventElKey) {
                var _eventElKey$split = eventElKey.split(' @'),
                    _eventElKey$split2 = slicedToArray(_eventElKey$split, 2),
                    eventKey = _eventElKey$split2[0],
                    elemKey = _eventElKey$split2[1];

                var elem = elemKey ? dom[elemKey][0] : dom.el[0];
                var eventHandler = handlers[eventElKey];

                elem.addEventListener(eventKey, eventHandler);
            });
        },
        mergeProps: function mergeProps(defaultProps) {
            var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var mergedProps = {};

            Object.keys(defaultProps).forEach(function (propKey) {
                var propValue = props[propKey] || defaultProps[propKey];
                mergedProps[propKey] = propValue;
            });

            return mergedProps;
        },
        validateProps: function validateProps(props, requiredProps) {
            Object.keys(props).forEach(function (propKey) {
                if (requiredProps.indexOf(propKey) > -1 && !props[propKey]) {
                    throw new Error(moduleName + ' requires prop: ' + propKey);
                }
            });
        }
    };

    var moduleProto = {
        moduleConstructor: function moduleConstructor(opts) {
            moduleProto.prepModule(opts);
            moduleProto.buildModule(opts);
            moduleProto.setupModule(opts);
            moduleProto.renderModule(opts);
            moduleProto.initModule(opts);
        },

        prepModule: function prepModule(opts) {
            var context = moduleUtils.createContext();

            if (moduleProps) {
                var mergedProps = moduleUtils.mergeProps(moduleProps, opts.props);
                context.extendWith({ props: mergedProps });

                if (moduleRequiredProps) {
                    moduleUtils.validateProps(mergedProps, moduleRequiredProps);
                }
            }

            opts.context = context;
        },
        buildModule: function buildModule(opts) {
            var context = opts.context;

            var boundMethods = moduleUtils.bindMethods(moduleMethods, context);

            if (boundMethods.render) {
                boundMethods.render = moduleUtils.wrapRenderMethod(boundMethods.render, opts);
            }

            context.extendWith(boundMethods);
            context.extendWith({ mediator: opts.mediator });
        },
        setupModule: function setupModule(opts) {
            var context = opts.context;

            if (context.setup) {
                context.setup();
            }

            if (moduleHandlers) {
                moduleUtils.registerHandlers(opts.mediator, moduleHandlers, context);
            }
        },
        renderModule: function renderModule(opts) {
            var context = opts.context;

            var mergedDom = void 0;

            if (context.render) {
                return;
            }

            if (moduleDom) {
                mergedDom = moduleUtils.mergeDom(moduleDom, opts.dom);
                moduleUtils.getDom(mergedDom);
                context.extendWith({ dom: mergedDom });
            }

            if (moduleHandlers.domEvents) {
                moduleUtils.registerDomHandlers(moduleHandlers.domEvents, context);
            }
        },
        initModule: function initModule(opts) {
            var context = opts.context;


            if (context.init) {
                context.init();
            }
        },
        destroyModule: function destroyModule() {}
    };

    return moduleProto.moduleConstructor;
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var utils = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;
exports.extend = extend;
exports.indexOf = indexOf;
exports.escapeExpression = escapeExpression;
exports.isEmpty = isEmpty;
exports.createFrame = createFrame;
exports.blockParams = blockParams;
exports.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

var badChars = /[&<>"'`=]/g,
    possible = /[&<>"'`=]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

var toString = Object.prototype.toString;

exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/* eslint-disable func-style */
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  exports.isFunction = isFunction = function (value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
exports.isFunction = isFunction;

/* eslint-enable func-style */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};

exports.isArray = isArray;
// Older IE versions do not directly support indexOf so we must implement our own, sadly.

function indexOf(array, value) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function createFrame(object) {
  var frame = extend({}, object);
  frame._parent = object;
  return frame;
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}

});

var exception = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var loc = node && node.loc,
      line = undefined,
      column = undefined;
  if (loc) {
    line = loc.start.line;
    column = loc.start.column;

    message += ' - ' + line + ':' + column;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  /* istanbul ignore else */
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }

  try {
    if (loc) {
      this.lineNumber = line;

      // Work around issue under safari where we can't directly set the column value
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(this, 'column', {
          value: column,
          enumerable: true
        });
      } else {
        this.column = column;
      }
    }
  } catch (nop) {
    /* Ignore if the browser is very particular */
  }
}

Exception.prototype = new Error();

exports['default'] = Exception;
module.exports = exports['default'];

});

var blockHelperMissing = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;



exports['default'] = function (instance) {
  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (utils.isArray(context)) {
      if (context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = utils.createFrame(options.data);
        data.contextPath = utils.appendContextPath(options.data.contextPath, options.name);
        options = { data: data };
      }

      return fn(context, options);
    }
  });
};

module.exports = exports['default'];

});

var each = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }





var _exception2 = _interopRequireDefault(exception);

exports['default'] = function (instance) {
  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (utils.isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = utils.createFrame(options.data);
    }

    function execIteration(field, index, last) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret = ret + fn(context[field], {
        data: data,
        blockParams: utils.blockParams([context[field], field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (utils.isArray(context)) {
        for (var j = context.length; i < j; i++) {
          if (i in context) {
            execIteration(i, i, i === context.length - 1);
          }
        }
      } else {
        var priorKey = undefined;

        for (var key in context) {
          if (context.hasOwnProperty(key)) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey !== undefined) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          }
        }
        if (priorKey !== undefined) {
          execIteration(priorKey, i - 1, true);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });
};

module.exports = exports['default'];

});

var helperMissing = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }



var _exception2 = _interopRequireDefault(exception);

exports['default'] = function (instance) {
  instance.registerHelper('helperMissing', function () /* [args, ]options */{
    if (arguments.length === 1) {
      // A missing field in a {{foo}} construct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });
};

module.exports = exports['default'];

});

var _if = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;



exports['default'] = function (instance) {
  instance.registerHelper('if', function (conditional, options) {
    if (utils.isFunction(conditional)) {
      conditional = conditional.call(this);
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (!options.hash.includeZero && !conditional || utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function (conditional, options) {
    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
  });
};

module.exports = exports['default'];

});

var log = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('log', function () /* message, options */{
    var args = [undefined],
        options = arguments[arguments.length - 1];
    for (var i = 0; i < arguments.length - 1; i++) {
      args.push(arguments[i]);
    }

    var level = 1;
    if (options.hash.level != null) {
      level = options.hash.level;
    } else if (options.data && options.data.level != null) {
      level = options.data.level;
    }
    args[0] = level;

    instance.log.apply(instance, args);
  });
};

module.exports = exports['default'];

});

var lookup = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('lookup', function (obj, field) {
    return obj && obj[field];
  });
};

module.exports = exports['default'];

});

var _with = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;



exports['default'] = function (instance) {
  instance.registerHelper('with', function (context, options) {
    if (utils.isFunction(context)) {
      context = context.call(this);
    }

    var fn = options.fn;

    if (!utils.isEmpty(context)) {
      var data = options.data;
      if (options.data && options.ids) {
        data = utils.createFrame(options.data);
        data.contextPath = utils.appendContextPath(options.data.contextPath, options.ids[0]);
      }

      return fn(context, {
        data: data,
        blockParams: utils.blockParams([context], [data && data.contextPath])
      });
    } else {
      return options.inverse(this);
    }
  });
};

module.exports = exports['default'];

});

var helpers = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;
exports.registerDefaultHelpers = registerDefaultHelpers;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }



var _helpersBlockHelperMissing2 = _interopRequireDefault(blockHelperMissing);



var _helpersEach2 = _interopRequireDefault(each);



var _helpersHelperMissing2 = _interopRequireDefault(helperMissing);



var _helpersIf2 = _interopRequireDefault(_if);



var _helpersLog2 = _interopRequireDefault(log);



var _helpersLookup2 = _interopRequireDefault(lookup);



var _helpersWith2 = _interopRequireDefault(_with);

function registerDefaultHelpers(instance) {
  _helpersBlockHelperMissing2['default'](instance);
  _helpersEach2['default'](instance);
  _helpersHelperMissing2['default'](instance);
  _helpersIf2['default'](instance);
  _helpersLog2['default'](instance);
  _helpersLookup2['default'](instance);
  _helpersWith2['default'](instance);
}

});

var inline = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;



exports['default'] = function (instance) {
  instance.registerDecorator('inline', function (fn, props, container, options) {
    var ret = fn;
    if (!props.partials) {
      props.partials = {};
      ret = function (context, options) {
        // Create a new partials stack frame prior to exec.
        var original = container.partials;
        container.partials = utils.extend({}, original, props.partials);
        var ret = fn(context, options);
        container.partials = original;
        return ret;
      };
    }

    props.partials[options.args[0]] = options.fn;

    return ret;
  });
};

module.exports = exports['default'];

});

var decorators = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;
exports.registerDefaultDecorators = registerDefaultDecorators;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }



var _decoratorsInline2 = _interopRequireDefault(inline);

function registerDefaultDecorators(instance) {
  _decoratorsInline2['default'](instance);
}

});

var logger_1 = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;



var logger = {
  methodMap: ['debug', 'info', 'warn', 'error'],
  level: 'info',

  // Maps a given level value to the `methodMap` indexes above.
  lookupLevel: function lookupLevel(level) {
    if (typeof level === 'string') {
      var levelMap = utils.indexOf(logger.methodMap, level.toLowerCase());
      if (levelMap >= 0) {
        level = levelMap;
      } else {
        level = parseInt(level, 10);
      }
    }

    return level;
  },

  // Can be overridden in the host environment
  log: function log(level) {
    level = logger.lookupLevel(level);

    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
      var method = logger.methodMap[level];
      if (!console[method]) {
        // eslint-disable-line no-console
        method = 'log';
      }

      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        message[_key - 1] = arguments[_key];
      }

      console[method].apply(console, message); // eslint-disable-line no-console
    }
  }
};

exports['default'] = logger;
module.exports = exports['default'];

});

var base = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;
exports.HandlebarsEnvironment = HandlebarsEnvironment;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }





var _exception2 = _interopRequireDefault(exception);







var _logger2 = _interopRequireDefault(logger_1);

var VERSION = '4.0.10';
exports.VERSION = VERSION;
var COMPILER_REVISION = 7;

exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1',
  7: '>= 4.0.0'
};

exports.REVISION_CHANGES = REVISION_CHANGES;
var objectType = '[object Object]';

function HandlebarsEnvironment(helpers$$1, partials, decorators$$1) {
  this.helpers = helpers$$1 || {};
  this.partials = partials || {};
  this.decorators = decorators$$1 || {};

  helpers.registerDefaultHelpers(this);
  decorators.registerDefaultDecorators(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: _logger2['default'],
  log: _logger2['default'].log,

  registerHelper: function registerHelper(name, fn) {
    if (utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple helpers');
      }
      utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (utils.toString.call(name) === objectType) {
      utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  },

  registerDecorator: function registerDecorator(name, fn) {
    if (utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple decorators');
      }
      utils.extend(this.decorators, name);
    } else {
      this.decorators[name] = fn;
    }
  },
  unregisterDecorator: function unregisterDecorator(name) {
    delete this.decorators[name];
  }
};

var log = _logger2['default'].log;

exports.log = log;
exports.createFrame = utils.createFrame;
exports.logger = _logger2['default'];

});

var safeString = createCommonjsModule(function (module, exports) {
// Build out our basic SafeString type
'use strict';

exports.__esModule = true;
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports['default'] = SafeString;
module.exports = exports['default'];

});

var runtime$1 = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;
exports.checkRevision = checkRevision;
exports.template = template;
exports.wrapProgram = wrapProgram;
exports.resolvePartial = resolvePartial;
exports.invokePartial = invokePartial;
exports.noop = noop;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }



var Utils = _interopRequireWildcard(utils);



var _exception2 = _interopRequireDefault(exception);



function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = base.COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = base.REVISION_CHANGES[currentRevision],
          compilerVersions = base.REVISION_CHANGES[compilerRevision];
      throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
    }
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  templateSpec.main.decorator = templateSpec.main_d;

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
      if (options.ids) {
        options.ids[0] = true;
      }
    }

    partial = env.VM.resolvePartial.call(this, partial, context, options);
    var result = env.VM.invokePartial.call(this, partial, context, options);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, options);
    }
    if (result != null) {
      if (options.indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = options.indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name) {
      if (!(name in obj)) {
        throw new _exception2['default']('"' + name + '" not defined in ' + obj);
      }
      return obj[name];
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        if (depths[i] && depths[i][name] != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function lambda(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function fn(i) {
      var ret = templateSpec[i];
      ret.decorator = templateSpec[i + '_d'];
      return ret;
    },

    programs: [],
    program: function program(i, data, declaredBlockParams, blockParams, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths || blockParams || declaredBlockParams) {
        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
      }
      return programWrapper;
    },

    data: function data(value, depth) {
      while (value && depth--) {
        value = value._parent;
      }
      return value;
    },
    merge: function merge(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },
    // An empty object to use as replacement for null-contexts
    nullContext: Object.seal({}),

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      if (options.depths) {
        depths = context != options.depths[0] ? [context].concat(options.depths) : options.depths;
      } else {
        depths = [context];
      }
    }

    function main(context /*, options*/) {
      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
    }
    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
    return main(context, options);
  }
  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      container.helpers = container.merge(options.helpers, env.helpers);

      if (templateSpec.usePartial) {
        container.partials = container.merge(options.partials, env.partials);
      }
      if (templateSpec.usePartial || templateSpec.useDecorators) {
        container.decorators = container.merge(options.decorators, env.decorators);
      }
    } else {
      container.helpers = options.helpers;
      container.partials = options.partials;
      container.decorators = options.decorators;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var currentDepths = depths;
    if (depths && context != depths[0] && !(context === container.nullContext && depths[0] === null)) {
      currentDepths = [context].concat(depths);
    }

    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
  }

  prog = executeDecorators(fn, prog, container, depths, data, blockParams);

  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

function resolvePartial(partial, context, options) {
  if (!partial) {
    if (options.name === '@partial-block') {
      partial = options.data['partial-block'];
    } else {
      partial = options.partials[options.name];
    }
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  // Use the current closure context to save the partial-block if this partial
  var currentPartialBlock = options.data && options.data['partial-block'];
  options.partial = true;
  if (options.ids) {
    options.data.contextPath = options.ids[0] || options.data.contextPath;
  }

  var partialBlock = undefined;
  if (options.fn && options.fn !== noop) {
    (function () {
      options.data = base.createFrame(options.data);
      // Wrapper function to get access to currentPartialBlock from the closure
      var fn = options.fn;
      partialBlock = options.data['partial-block'] = function partialBlockWrapper(context) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        // Restore the partial-block from the closure for the execution of the block
        // i.e. the part inside the block of the partial call.
        options.data = base.createFrame(options.data);
        options.data['partial-block'] = currentPartialBlock;
        return fn(context, options);
      };
      if (fn.partials) {
        options.partials = Utils.extend({}, options.partials, fn.partials);
      }
    })();
  }

  if (partial === undefined && partialBlock) {
    partial = partialBlock;
  }

  if (partial === undefined) {
    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? base.createFrame(data) : {};
    data.root = context;
  }
  return data;
}

function executeDecorators(fn, prog, container, depths, data, blockParams) {
  if (fn.decorator) {
    var props = {};
    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
    Utils.extend(prog, props);
  }
  return prog;
}

});

var noConflict = createCommonjsModule(function (module, exports) {
/* global window */
'use strict';

exports.__esModule = true;

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  var root = typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
    return Handlebars;
  };
};

module.exports = exports['default'];

});

var handlebars_runtime = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }



var base$$1 = _interopRequireWildcard(base);

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)



var _handlebarsSafeString2 = _interopRequireDefault(safeString);



var _handlebarsException2 = _interopRequireDefault(exception);



var Utils = _interopRequireWildcard(utils);



var runtime = _interopRequireWildcard(runtime$1);



var _handlebarsNoConflict2 = _interopRequireDefault(noConflict);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  var hb = new base$$1.HandlebarsEnvironment();

  Utils.extend(hb, base$$1);
  hb.SafeString = _handlebarsSafeString2['default'];
  hb.Exception = _handlebarsException2['default'];
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = runtime;
  hb.template = function (spec) {
    return runtime.template(spec, hb);
  };

  return hb;
}

var inst = create();
inst.create = create;

_handlebarsNoConflict2['default'](inst);

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];

});

// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
var runtime = handlebars_runtime['default'];

var Template = runtime.template({ "compiler": [7, ">= 4.0.0"], "main": function main(container, depth0, helpers, partials, data) {
    return "<i class='typester-icon'>\n    <svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n         viewBox=\"0 0 20 20\" enable-background=\"new 0 0 20 20\" xml:space=\"preserve\" width=\"20px\" height=\"20px\">\n        <path id=\"XMLID_110_\" d=\"M9.2,18.4c-2.1,2.1-5.5,2.1-7.7,0c-2.1-2.1-2.1-5.6,0-7.7l2.9-2.8C4.3,9,4.5,10,4.8,11l-1.5,1.5\n            c-1.1,1.1-1.1,3,0,4.1c1.1,1.1,3,1.1,4.1,0l3.1-3.1c1.2-1.1,1.2-3,0-4.1c-0.5-0.5-0.5-1.3,0-1.8s1.3-0.5,1.8,0\n            c2.1,2.1,2.1,5.6,0,7.7L9.2,18.4z M15.6,12.1c0.1-1.1,0-2.1-0.4-3.1l1.5-1.5c1.1-1.1,1.1-3,0-4.1s-3-1.1-4.1,0L9.4,6.5\n            c-1.1,1.2-1.1,3,0,4.1c0.5,0.5,0.5,1.3,0,1.8c-0.5,0.5-1.3,0.5-1.8,0c-2.1-2.1-2.1-5.6,0-7.7l3.1-3.1c2.1-2.1,5.6-2.1,7.7,0\n            c2.1,2.1,2.1,5.5,0,7.7L15.6,12.1z\"/>\n    </svg>\n</i>\n";
  }, "useData": true });
var linkIcon = function (data, options, asString) {
  var html = Template(data, options);
  return asString || typeof $ === 'undefined' ? html : $(html);
};

var Template$1 = runtime.template({ "compiler": [7, ">= 4.0.0"], "main": function main(container, depth0, helpers, partials, data) {
    return "<i class='typester-icon'>\n    <svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n       viewBox=\"0 0 20 20\" enable-background=\"new 0 0 20 20\" xml:space=\"preserve\" width=\"20px\" height=\"20px\">\n       <path id=\"XMLID_126_\" d=\"M20,7.6C20,7.8,19.8,8,19.6,8H6.9C6.7,8,6.5,7.8,6.5,7.6V5.3C6.5,5.1,6.7,5,6.9,5h12.7\n        C19.8,5,20,5.1,20,5.3V7.6z M20,13.5c0-0.2-0.2-0.4-0.4-0.4H6.9c-0.2,0-0.4,0.2-0.4,0.4v2.2c0,0.2,0.2,0.4,0.4,0.4h12.7\n        c0.2,0,0.4-0.2,0.4-0.4V13.5z M1.6,8.4H3v-5H1.9C1.8,4.1,1.3,4.5,0.5,4.6v1h1V8.4z M0,16.6h4.1v-1.2h-2v0c0.5-0.4,1.1-0.7,1.6-1.2\n        c0.3-0.3,0.4-0.6,0.4-1.1c0-0.9-0.7-1.6-2-1.6c-0.9,0-1.6,0.4-1.8,0.9c-0.2,0.3-0.2,0.6-0.2,1.2h1.4c0-0.3,0.1-0.5,0.2-0.7\n        c0.1-0.2,0.3-0.2,0.5-0.2c0.4,0,0.6,0.2,0.6,0.5c0,0.3-0.2,0.5-0.4,0.7c-0.5,0.4-1.3,0.8-1.7,1.3C0.1,15.5,0,15.9,0,16.6z\"/>\n    </svg>\n</i>\n";
  }, "useData": true });
var orderedlistIcon = function (data, options, asString) {
  var html = Template$1(data, options);
  return asString || typeof $ === 'undefined' ? html : $(html);
};

var Template$2 = runtime.template({ "compiler": [7, ">= 4.0.0"], "main": function main(container, depth0, helpers, partials, data) {
    return "<i class='typester-icon'>\n    <svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n       viewBox=\"0 0 20 20\" enable-background=\"new 0 0 20 20\" xml:space=\"preserve\" width=\"20px\" height=\"20px\">\n       <path id=\"XMLID_3_\" d=\"M3.3,4.2c0,0.2-0.2,0.4-0.4,0.4H0.4C0.2,4.6,0,4.4,0,4.2V1.7c0-0.2,0.2-0.4,0.4-0.4h2.5\n        c0.2,0,0.4,0.2,0.4,0.4V4.2z M3.3,11.3c0,0.2-0.2,0.4-0.4,0.4H0.4c-0.2,0-0.4-0.2-0.4-0.4V8.8c0-0.2,0.2-0.4,0.4-0.4h2.5\n        c0.2,0,0.4,0.2,0.4,0.4V11.3z M3.3,18.3c0,0.2-0.2,0.4-0.4,0.4H0.4c-0.2,0-0.4-0.2-0.4-0.4v-2.5c0-0.2,0.2-0.4,0.4-0.4h2.5\n        c0.2,0,0.4,0.2,0.4,0.4V18.3z M20,4.2c0,0.2-0.2,0.4-0.4,0.4H5.4C5.2,4.6,5,4.4,5,4.2V1.7c0-0.2,0.2-0.4,0.4-0.4h14.2\n        c0.2,0,0.4,0.2,0.4,0.4V4.2z M20,11.3c0,0.2-0.2,0.4-0.4,0.4H5.4c-0.2,0-0.4-0.2-0.4-0.4V8.8c0-0.2,0.2-0.4,0.4-0.4h14.2\n        c0.2,0,0.4,0.2,0.4,0.4V11.3z M20,18.3c0,0.2-0.2,0.4-0.4,0.4H5.4c-0.2,0-0.4-0.2-0.4-0.4v-2.5c0-0.2,0.2-0.4,0.4-0.4h14.2\n        c0.2,0,0.4,0.2,0.4,0.4V18.3z\"/>\n    </svg>\n</i>\n";
  }, "useData": true });
var unorderedlistIcon = function (data, options, asString) {
  var html = Template$2(data, options);
  return asString || typeof $ === 'undefined' ? html : $(html);
};

var Template$3 = runtime.template({ "compiler": [7, ">= 4.0.0"], "main": function main(container, depth0, helpers, partials, data) {
    return "<i class='typester-icon'>\n    <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" width=\"768\" height=\"768\" viewBox=\"0 0 768 768\">\n        <path d=\"M494.819 659.759l108.242-221.638h-164.939v-329.879h329.879v329.879l-108.241 221.638h-164.939zM54.121 659.759l110.819-221.638h-164.939v-329.879h329.879v329.879l-110.819 221.638h-164.939z\"></path>\n    </svg>\n</i>\n";
  }, "useData": true });
var quoteIcon = function (data, options, asString) {
  var html = Template$3(data, options);
  return asString || typeof $ === 'undefined' ? html : $(html);
};

// jshint strict: false

/**
* @access protected
*/
var Toolbar$2 = {
    buttons: ['bold', 'italic', 'h1', 'h2', 'orderedlist', 'unorderedlist', 'quote', 'link'],
    preventNewlineDefault: ['ul', 'ol'],
    blockTags: ['P'],
    validTags: ['P'],
    listTags: [],
    getValidTags: function getValidTags() {
        var validTags = Toolbar$2.validTags;


        if (validTags.length === 1) {
            Toolbar$2.parseForTagLists();
        }

        return Toolbar$2.validTags;
    },
    getBlockTags: function getBlockTags() {
        var blockTags = Toolbar$2.blockTags;


        if (blockTags.length === 1) {
            Toolbar$2.parseForTagLists();
        }

        return Toolbar$2.blockTags;
    },
    getListTags: function getListTags() {
        var listTags = Toolbar$2.listTags;


        if (listTags.length === 0) {
            Toolbar$2.parseForTagLists();
        }

        return Toolbar$2.listTags;
    },
    parseForTagLists: function parseForTagLists() {
        var validTags = Toolbar$2.validTags,
            blockTags = Toolbar$2.blockTags,
            listTags = Toolbar$2.listTags;


        Toolbar$2.buttons.forEach(function (buttonKey) {
            var buttonConfig = Toolbar$2.buttonConfigs[buttonKey];
            var configValidTags = buttonConfig.opts.validTags;

            validTags = validTags.concat(configValidTags);

            switch (buttonConfig.formatter) {
                case 'block':
                    blockTags = blockTags.concat(configValidTags);
                    break;
                case 'list':
                    listTags = listTags.concat(configValidTags);
                    break;
            }
        });

        Toolbar$2.validTags = validTags;
        Toolbar$2.blockTags = blockTags;
        Toolbar$2.listTags = listTags;
    },

    buttonConfigs: {
        // Text styles
        bold: {
            formatter: 'text',
            opts: {
                style: 'bold',
                rootEl: 'b',
                validTags: ['B', 'STRONG']
            },
            content: '<b>B</b>',
            disabledIn: ['H1', 'H2', 'BLOCKQUOTE'],
            activeIn: ['B']
        },

        italic: {
            formatter: 'text',
            opts: {
                style: 'italic',
                rootEl: 'i',
                validTags: ['I']
            },
            content: '<i>I</i>',
            activeIn: ['I']
        },

        underline: {
            formatter: 'text:underline',
            content: '<u>U</u>'
        },

        strikethrough: {
            formatter: 'text:strikethrough',
            content: '<s>A</s>'
        },

        superscript: {
            formatter: 'text:superscript',
            content: 'x<sup>1</sup>'
        },

        subscript: {
            formatter: 'text:subscript',
            content: 'x<sub>1</sub>'
        },

        // Paragraph styles
        justifyCenter: {
            formatter: 'paragraph:justifyCenter'
        },

        justifyFull: {
            formatter: 'paragraph:justifyFull'
        },

        justifyLeft: {
            formatter: 'paragraph:justifyLeft'
        },

        justifyRight: {
            formatter: 'paragraph:justifyRight'
        },

        indent: {
            formatter: 'paragraph:indent'
        },

        outdent: {
            formatter: 'paragraph:outdent'
        },

        // Lists
        orderedlist: {
            formatter: 'list',
            content: orderedlistIcon({}, {}, true),
            opts: {
                style: 'ordered',
                validTags: ['OL', 'LI']
            },
            activeIn: ['OL']
        },

        unorderedlist: {
            formatter: 'list',
            content: unorderedlistIcon({}, {}, true),
            opts: {
                style: 'unordered',
                validTags: ['UL', 'LI']
            },
            activeIn: ['UL']
        },

        // Block level elements
        quote: {
            formatter: 'block',
            content: quoteIcon({}, {}, true),
            opts: {
                style: 'BLOCKQUOTE',
                validTags: ['BLOCKQUOTE']
            },
            activeIn: ['BLOCKQUOTE'],
            disabledIn: function disabledIn(mediator) {
                var disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },

            toggles: true
        },

        pre: {
            formatter: 'block',
            opts: {
                style: 'PRE'
            },
            disabledIn: function disabledIn(mediator) {
                var disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },

            content: 'PRE'
        },

        h1: {
            formatter: 'block',
            opts: {
                style: 'H1',
                validTags: ['H1']
            },
            content: 'H1',
            activeIn: ['H1'],
            disabledIn: function disabledIn(mediator) {
                var disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },

            toggles: true
        },

        h2: {
            formatter: 'block',
            opts: {
                style: 'H2',
                validTags: ['H2']
            },
            content: 'H2',
            activeIn: ['H2'],
            disabledIn: function disabledIn(mediator) {
                var disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },

            toggles: true
        },

        h3: {
            formatter: 'block',
            opts: {
                style: 'H3',
                validTags: ['H3']
            },
            content: 'H3',
            activeIn: ['H3'],
            disabledIn: function disabledIn(mediator) {
                var disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },

            toggles: true
        },

        h4: {
            formatter: 'block',
            opts: {
                style: 'H4',
                validTags: ['H4']
            },
            content: 'H4',
            activeIn: ['H4'],
            disabledIn: function disabledIn(mediator) {
                var disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },

            toggles: true
        },

        h5: {
            formatter: 'block',
            opts: {
                style: 'H5',
                validTags: ['H5']
            },
            content: 'H5',
            activeIn: ['H5'],
            disabledIn: function disabledIn(mediator) {
                var disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },

            toggles: true
        },

        h6: {
            formatter: 'block',
            opts: {
                style: 'H6',
                validTags: ['H6']
            },
            content: 'H6',
            activeIn: ['H6'],
            disabledIn: function disabledIn(mediator) {
                var disabled = mediator.get('selection:in:or:contains', ['OL', 'UL']);
                disabled = disabled || mediator.get('selection:spans:multiple:blocks');
                return disabled;
            },

            toggles: true
        },

        // Link
        link: {
            formatter: 'link',
            opts: {
                validTags: ['A']
            },
            content: linkIcon({}, {}, true),
            activeIn: ['A'],
            disabledIn: function disabledIn(mediator) {
                var disabled = mediator.get('selection:spans:multiple:blocks');
                return disabled;
            }
        }
    }
};

var Template$4 = runtime.template({ "1": function _(container, depth0, helpers, partials, data, blockParams) {
    var stack1, helper;

    return "            <li>\n                <a class='typester-menu-item' data-config-key='" + container.escapeExpression((helper = (helper = helpers.configKey || (depth0 != null ? depth0.configKey : depth0)) != null ? helper : helpers.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, { "name": "configKey", "hash": {}, "data": data }) : helper)) + "'>\n                    " + ((stack1 = container.lambda((stack1 = blockParams[0][0]) != null ? stack1.content : stack1, depth0)) != null ? stack1 : "") + "\n                </a>\n            </li>\n";
  }, "compiler": [7, ">= 4.0.0"], "main": function main(container, depth0, helpers, partials, data, blockParams) {
    var stack1;

    return "<div class='typester-toolbar'>\n    <ul class='buttons-wrapper s--active'>\n" + ((stack1 = helpers.each.call(depth0 != null ? depth0 : container.nullContext || {}, depth0 != null ? depth0.buttons : depth0, { "name": "each", "hash": {}, "fn": container.program(1, data, 1, blockParams), "inverse": container.noop, "data": data, "blockParams": blockParams })) != null ? stack1 : "") + "    </ul>\n    <div class='inputs-wrapper'>\n        <input class='link-input' type='text' name='link-uri'/>\n    </div>\n</div>\n";
  }, "useData": true, "useBlockParams": true });
var toolbarTemplate = function (data, options, asString) {
  var html = Template$4(data, options);
  return asString || typeof $ === 'undefined' ? html : $(html);
};

var toolbarStyles = ".typester-toolbar .buttons-wrapper,\n.typester-toolbar .inputs-wrapper {\n  transition: opacity 200ms, -webkit-transform 200ms;\n  transition: opacity 200ms, transform 200ms;\n  transition: opacity 200ms, transform 200ms, -webkit-transform 200ms;\n  -webkit-transform: translateY(-40px);\n          transform: translateY(-40px);\n  opacity: 0; }\n  .typester-toolbar .buttons-wrapper.s--active,\n  .typester-toolbar .inputs-wrapper.s--active {\n    -webkit-transform: translateY(0px);\n            transform: translateY(0px);\n    opacity: 1; }\n\n.typester-toolbar .inputs-wrapper {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%; }\n\n.typester-toolbar ul {\n  overflow: hidden;\n  list-style: none; }\n\n.typester-toolbar li {\n  float: left;\n  list-style: none; }\n\n.typester-toolbar .typester-menu-item {\n  color: #FFF;\n  font-family: sans-serif;\n  font-size: 16px;\n  width: 40px;\n  height: 40px;\n  display: block;\n  line-height: 40px;\n  font-weight: bold;\n  text-align: center;\n  cursor: pointer;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none; }\n  .typester-toolbar .typester-menu-item svg {\n    display: block;\n    fill: #FFF;\n    height: 16px;\n    width: 16px;\n    padding: 12px; }\n  .typester-toolbar .typester-menu-item b {\n    font-weight: bold; }\n  .typester-toolbar .typester-menu-item i {\n    font-style: italic; }\n  .typester-toolbar .typester-menu-item:hover {\n    background: #00aeef; }\n  .typester-toolbar .typester-menu-item.s--active {\n    background: #0089bc; }\n  .typester-toolbar .typester-menu-item[disabled] {\n    width: 0;\n    overflow: hidden; }\n";

// jshint strict: false
/**
* @access protected
*/
var Toolbar = Module({
    name: 'Toolbar',
    dom: {
        'toolbarMenuItems': '.typester-menu-item'
    },
    props: {
        el: null,
        styles: null,
        mouseover: 0,
        classNames: {
            MENU_ITEM: 'typester-menu-item',
            ACTIVE: 's--active'
        }
    },
    handlers: {
        commands: {
            'toolbar:hide': 'hideToolbar',
            'toolbar:set:buttons': 'setButtons'
        },
        events: {
            // 'contenteditable:focus': 'showToolbar',
            'app:destroy': 'destroy',
            'selection:update': 'handleSelectionChange',
            // 'selection:start' : 'handleSelectStart',
            'selection:change': 'handleSelectionChange',
            'mouse:down': 'handleMouseDown',
            'mouse:up': 'handleMouseUp',
            'import:from:canvas:complete': 'handleCanvasImport'
        },
        domEvents: {
            'click': 'handleToolbarClick',
            'mouseover': 'handleMouseOver',
            'mouseout': 'handleMouseOut'
        }
    },
    methods: {
        setup: function setup() {
            this.appendStyles();
            this.render();
        },
        init: function init() {
            this.updateToolbarState();
        },
        appendStyles: function appendStyles() {
            var props = this.props;

            props.styles = DOM.addStyles(toolbarStyles);
        },
        render: function render() {
            var mediator = this.mediator,
                props = this.props;

            var buttonConfigs = this.getButtonConfigs();
            var wrapperEl = document.createElement('div');

            var toolbarHTML = toolbarTemplate(buttonConfigs);

            if (typeof toolbarHTML === 'string') {
                wrapperEl.innerHTML = toolbarHTML;
            } else {
                wrapperEl.appendChild(toolbarHTML[0]);
            }

            var toolbarEl = wrapperEl.childNodes[0];
            props.flyout = props.flyout || mediator.get('flyout:new');
            props.flyout.clearContent();
            props.flyout.show();
            props.flyout.appendContent(wrapperEl.childNodes[0]);

            return toolbarEl;
        },
        getButtonConfigs: function getButtonConfigs() {
            var mediator = this.mediator;

            var contentEditableButtons = mediator.get('contenteditable:toolbar:buttons') || [];
            var configButtons = contentEditableButtons.length ? contentEditableButtons : Toolbar$2.buttons;

            var buttons = [];

            configButtons.forEach(function (configKey) {
                // NB This needs to be looked at
                if (configKey === 'anchor') {
                    configKey = 'link';
                }
                var buttonConfig = Object.assign({ configKey: configKey }, Toolbar$2.buttonConfigs[configKey]);
                buttons.push(buttonConfig);
            });

            return { buttons: buttons };
        },
        handleToolbarClick: function handleToolbarClick(evnt) {
            var mediator = this.mediator,
                props = this.props;

            mediator.exec('contenteditable:refocus');
            mediator.exec('selection:reselect');

            var menuItemEl = DOM.getClosest(evnt.target, '.' + props.classNames.MENU_ITEM);
            var dataset = menuItemEl.dataset;
            var configKey = dataset.configKey;

            var buttonConfig = Toolbar$2.buttonConfigs[configKey];
            var formatter = buttonConfig.formatter,
                opts = buttonConfig.opts;

            var toolbarMenuItemState = this.getMenuItemState(menuItemEl);

            opts.toggle = buttonConfig.toggles && toolbarMenuItemState.isActive;
            mediator.exec('format:' + formatter, opts);
        },


        // handleSelectStart () {
        //     this.hideToolbar();
        // },

        handleSelectionChange: function handleSelectionChange() {
            var _this = this;

            var props = this.props;

            if (props.selectionChangeTimeout) {
                clearTimeout(props.selectionChangeTimeout);
            }
            props.selectionChangeTimeout = setTimeout(function () {
                _this.updateToolbarState();
            }, 10);
        },
        handleMouseDown: function handleMouseDown() {
            this.updateToolbarState();
        },
        handleMouseUp: function handleMouseUp() {
            this.updateToolbarState();
        },
        handleMouseOver: function handleMouseOver() {
            var props = this.props;

            props.mouseover += 1;
            props.mouseover = Math.min(1, props.mouseover);
        },
        handleMouseOut: function handleMouseOut() {
            var props = this.props;

            props.mouseover -= 1;
            props.mouseover = Math.max(0, props.mouseover);
        },
        handleCanvasImport: function handleCanvasImport() {
            this.updateToolbarState();
        },
        hideToolbar: function hideToolbar() {
            var props = this.props;

            props.flyout.hide();
        },
        showToolbar: function showToolbar() {
            this.render();
        },
        positionToolbar: function positionToolbar() {
            var mediator = this.mediator,
                props = this.props;

            var selectionBounds = mediator.get('selection:bounds');

            if (selectionBounds.initialWidth > 0) {
                var scrollOffset = DOM.getScrollOffset();
                var docRelTop = selectionBounds.top + scrollOffset.y;
                var docRelLeft = selectionBounds.initialLeft + scrollOffset.x;
                var docRelCenter = selectionBounds.initialWidth / 2 + docRelLeft;

                props.flyout.position({
                    left: docRelCenter + 'px',
                    top: docRelTop + 'px'
                });
            }
        },
        updateToolbarState: function updateToolbarState() {
            var mediator = this.mediator,
                props = this.props;

            var currentSelection = mediator.get('selection:current');
            var linkFormatterActive = mediator.get('format:link:active');
            var mouseIsDown = mediator.get('mouse:is:down');

            if (!currentSelection || currentSelection.isCollapsed || !currentSelection.toString().trim().length || linkFormatterActive || !document.activeElement.hasAttribute('contenteditable') || mouseIsDown) {
                if (props.mouseover) {
                    return;
                }
                this.hideToolbar();
            } else {
                this.positionToolbar();
                this.showToolbar();
                this.updateMenuItems();
            }
        },
        updateMenuItems: function updateMenuItems() {
            var dom = this.dom,
                mediator = this.mediator;

            mediator.exec('selection:ensure:text:only');
            for (var i = 0; i < dom.toolbarMenuItems.length; i++) {
                var toolbarMenuItem = dom.toolbarMenuItems[i];
                this.updateMenuItemState(toolbarMenuItem);
            }
        },
        updateMenuItemState: function updateMenuItemState(toolbarMenuItem) {
            var props = this.props;

            var toolbarMenuItemState = this.getMenuItemState(toolbarMenuItem);

            if (toolbarMenuItemState.isDisabled) {
                toolbarMenuItem.setAttribute('disabled', '');
            } else {
                toolbarMenuItem.removeAttribute('disabled');
            }

            DOM.toggleClass(toolbarMenuItem, props.classNames.ACTIVE, toolbarMenuItemState.isActive);
        },
        getMenuItemState: function getMenuItemState(toolbarMenuItem) {
            var mediator = this.mediator;
            var configKey = toolbarMenuItem.dataset.configKey;


            var config = Toolbar$2.buttonConfigs[configKey];

            var activeIn = config.activeIn || [];
            var disabledIn = config.disabledIn || [];
            var isActive = mediator.get('selection:in:or:contains', activeIn);

            var isDisabled = false;
            if (typeof disabledIn === 'function') {
                isDisabled = disabledIn.call(config, mediator);
            } else {
                isDisabled = mediator.get('selection:in:or:contains', disabledIn);
            }

            return {
                isActive: isActive,
                isDisabled: isDisabled
            };
        },
        destroy: function destroy() {
            var props = this.props;

            props.flyout.remove();
        }
    }
});

var Template$5 = runtime.template({ "compiler": [7, ">= 4.0.0"], "main": function main(container, depth0, helpers, partials, data) {
    var stack1, helper;

    return "<div class='typester-flyout place-above'>\n    <div class='typester-flyout-content'>\n        " + ((stack1 = (helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : helpers.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, { "name": "content", "hash": {}, "data": data }) : helper)) != null ? stack1 : "") + "\n    </div>\n</div>\n";
  }, "useData": true });
var flyoutTemplate = function (data, options, asString) {
  var html = Template$5(data, options);
  return asString || typeof $ === 'undefined' ? html : $(html);
};

var flyoutStyles = ".typester-flyout {\n  transition: top 200ms, left 200ms;\n  position: absolute;\n  z-index: 1600;\n  top: 50%;\n  left: 50%; }\n  .typester-flyout .typester-flyout-content {\n    background: #201f20;\n    height: 40px;\n    width: auto; }\n    .typester-flyout .typester-flyout-content:after {\n      content: '';\n      position: absolute;\n      left: 50%;\n      height: 0;\n      width: 0;\n      border-left: 10px solid transparent;\n      border-right: 10px solid transparent; }\n  .typester-flyout.place-above {\n    -webkit-transform: translate3d(-50%, -100%, 0);\n            transform: translate3d(-50%, -100%, 0);\n    padding-bottom: 12px; }\n    .typester-flyout.place-above .typester-flyout-content:after {\n      top: 100%;\n      border-top: 10px solid #201f20;\n      -webkit-transform: translate3d(-50%, -13px, 0);\n              transform: translate3d(-50%, -13px, 0); }\n  .typester-flyout.place-below {\n    -webkit-transform: translate3d(-50%, 0, 0);\n            transform: translate3d(-50%, 0, 0);\n    padding-top: 12px; }\n    .typester-flyout.place-below .typester-flyout-content:after {\n      bottom: 100%;\n      border-bottom: 10px solid #201f20;\n      -webkit-transform: translate3d(-50%, 13px, 0);\n              transform: translate3d(-50%, 13px, 0); }\n  .typester-flyout a {\n    color: #FFF; }\n";

// jshint strict: false
/**
* @access protected
*/
var Flyout = Module({
    name: 'Flyout',
    dom: {},
    props: {
        minZIndex: 90,
        styles: null,
        flyouts: []
    },
    handlers: {
        requests: {
            'flyout:new': 'newFlyout'
        },
        commands: {},
        events: {
            'app:destroy': 'destroy'
        }
    },
    methods: {
        setup: function setup() {
            this.appendStyles();
        },
        init: function init() {},
        appendStyles: function appendStyles() {
            var props = this.props;

            props.styles = DOM.addStyles(flyoutStyles);
        },
        newFlyout: function newFlyout() {
            var props = this.props;

            var flyout = this.buildFlyout();
            props.flyouts.push(flyout);
            return flyout;
        },
        buildFlyout: function buildFlyout() {
            var _this = this;

            var flyout = {
                el: this.buildTemplate(),
                appended: null
            };

            flyout.contentEl = flyout.el.querySelector('.typester-flyout-content');

            flyout.clearContent = function () {
                flyout.contentEl.innerHTML = '';
            };

            flyout.appendContent = function (content) {
                return DOM.appendTo(flyout.contentEl, content);
            };
            flyout.show = function () {
                _this.showFlyout(flyout);
            };
            flyout.remove = function () {
                _this.removeFlyout(flyout);
            };
            flyout.hide = function () {
                _this.hideFlyout(flyout);
            };
            flyout.position = function (coordinates) {
                _this.positionFlyout(flyout, coordinates);
            };
            flyout.setPlacement = function (placement) {
                _this.setPlacement(flyout, placement);
            };

            return flyout;
        },
        buildTemplate: function buildTemplate() {
            var wrapperEl = document.createElement('div');
            var flyoutHTML = void 0,
                flyoutEl = void 0;

            flyoutHTML = flyoutTemplate();
            if (typeof flyoutHTML === 'string') {
                wrapperEl.innerHTML = flyoutHTML;
            } else {
                wrapperEl.appendChild(flyoutHTML[0]);
            }
            flyoutEl = wrapperEl.childNodes[0];

            return flyoutEl;
        },
        appendFlyout: function appendFlyout(flyout) {
            DOM.appendTo(document.body, flyout.el);
        },
        removeFlyout: function removeFlyout(flyout) {
            if (flyout.appended) {
                DOM.removeNode(flyout.el);
                flyout.appended = false;
            }
        },
        positionFlyout: function positionFlyout(flyout, coordinates) {
            var mediator = this.mediator,
                props = this.props;

            var contentEditableEl = mediator.get('contenteditable:element');
            var containerZIndex = Math.max(props.minZIndex, DOM.getContainerZIndex(contentEditableEl));

            Object.keys(coordinates).forEach(function (coordinateKey) {
                flyout.el.style[coordinateKey] = coordinates[coordinateKey];
            });

            flyout.el.style.zIndex = containerZIndex + 1;
        },
        setPlacement: function setPlacement(flyout) {
            var placement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'above';

            flyout.el.classList.remove('place-below');
            flyout.el.classList.remove('place-above');
            flyout.el.classList.add('place-' + placement);
        },
        showFlyout: function showFlyout(flyout) {
            if (!flyout.appended) {
                this.appendFlyout(flyout);
                flyout.appended = true;
            } else {
                flyout.el.style.display = 'block';
            }
        },
        hideFlyout: function hideFlyout(flyout) {
            flyout.el.style.display = 'none';
        },
        destroy: function destroy() {
            var props = this.props;

            props.flyouts.forEach(function (flyout) {
                flyout.remove();
            });
        }
    }
});

// jshint strict: false

/**
* @access protected
*/
var Mouse = Module({
    name: 'Mouse',
    props: {
        mousedown: 0
    },
    dom: {},
    handlers: {
        requests: {
            'mouse:is:down': 'mouseIsDown'
        },
        commands: {},
        events: {
            'contenteditable:blur': 'handleContentEditableBlur'
        }
    },
    methods: {
        init: function init() {
            var _this = this;

            var mediator = this.mediator;

            document.body.onmousedown = function () {
                _this.setMousedown();
                mediator.emit('mouse:down');
            };
            document.body.onmouseup = function () {
                _this.unsetMousedown();
                mediator.emit('mouse:up');
            };
            // document.body.onmouseout = () => {
            //     props.mousedown = 0;
            // };
        },
        setMousedown: function setMousedown() {
            var props = this.props;

            props.mousedown += 1;
            props.mousedown = Math.min(1, props.mousedown);
        },
        unsetMousedown: function unsetMousedown() {
            var props = this.props;

            props.mousedown -= 1;
            props.mousedown = Math.max(0, props.mousedown);
        },
        mouseIsDown: function mouseIsDown() {
            var props = this.props;

            return !!props.mousedown;
        },
        handleContentEditableBlur: function handleContentEditableBlur() {
            var props = this.props;

            props.mousedown = 0;
        }
    }
});

// jshint strict: false

/**
 * UIContainer - Initializes and bootstraps the UI modules. It requires only a
 * mediator instance to delegate events to.
 *
 * @access protected
 * @module containers/UIContainer
 *
 * @requires core/Container
 * @requires modules/Toolbar
 * @requires modules/Flyout
 * @requires modulesMouse
 *
 * @example
 * new UIContainer({ mediator: mediatorInstance });
 */
/**
 * @constructor UIContainer
 * @param {object} opts={} - container options
 * @param {mediator} opts.mediator - The mediator to delegate events to
 * @return {container} UIContainer instance
 */
var UIContainer = Container({
    name: 'UIContainer',

    /**
     * Child Modules: [{@link modules/Flyout}, {@link modules/Toolbar}]
     * Note: The Toobar is instantiated with the document body set as it's dom.el.
     * @enum {Array<{class:Module}>} modules    
     */
    modules: [{
        class: Flyout
    }, {
        class: Toolbar,
        opts: {
            dom: {
                el: document.body
            }
        }
    }, {
        class: Mouse
    }]
});

/**
 * A config object. Was meant to be more than this. Will revise.
 * At the moment it just specifies that the defalt block type is "P"
 *
 * @access protected
 * @module config/config
 */

var config = {
    defaultBlock: 'P',
    blockElementNames: ['blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'li', 'p', 'pre', 'address', 'article', 'aside', 'canvas', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'header', 'hgroup', 'hr', 'main', 'nav', 'noscript', 'output', 'section', 'table', 'tfoot', 'video']
};

// jshint strict: false
/**
* @access protected
*/
var commands = {
    exec: function exec(command) {
        var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var contextDocument = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document;

        if (command === 'formatBlock') {
            value = commands.prepBlockValue(value);
        }
        contextDocument.execCommand(command, false, value);
    },
    formatBlock: function formatBlock(style) {
        var contextDocument = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

        commands.exec('formatBlock', style, contextDocument);
    },
    defaultBlockFormat: function defaultBlockFormat() {
        var contextDocument = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;

        commands.formatBlock(config.defaultBlock, contextDocument);
    },
    prepBlockValue: function prepBlockValue(value) {
        var ieVersion = browser.ieVersion();
        value = value.toUpperCase();
        return ieVersion && ieVersion < 12 ? '<' + value + '>' : value;
    }
};

// jshint strict: false
/**
* @access protected
*/
var zeroWidthSpaceEntity = '&ZeroWidthSpace;';

/**
* @access protected
*/
var zeroWidthSpace = {
    generate: function generate() {
        var tmpEl = document.createElement('span');
        tmpEl.innerHTML = zeroWidthSpaceEntity;
        return tmpEl;
    },
    get: function get() {
        var tmpEl = zeroWidthSpace.generate();
        return tmpEl.firstChild;
    },
    assert: function assert(node) {
        var tmpEl = zeroWidthSpace.generate();
        if (node.nodeType === Node.ELEMENT_NODE) {
            return node.innerHTML === tmpEl.innerHTML;
        } else if (node.nodeType === Node.TEXT_NODE) {
            return node.nodeValue === tmpEl.firstChild.nodeValue;
        }
    }
};

// jshint strict: false

var validTags = Toolbar$2.getValidTags();
var blockTags = Toolbar$2.getBlockTags();
var listTags = Toolbar$2.getListTags();

/**
* @access protected
*/
var BaseFormatter = Module({
    name: 'BaseFormatter',
    props: {},
    handlers: {
        requests: {},
        commands: {
            'format:export:to:canvas': 'exportToCanvas',
            'format:import:from:canvas': 'importFromCanvas',
            'format:default': 'formatDefault',
            'format:clean': 'formatClean'
        },
        events: {
            'contenteditable:newline': 'handleNewLine'
        }
    },
    methods: {
        init: function init() {},
        exportToCanvas: function exportToCanvas() {
            var mediator = this.mediator;

            var rootElement = mediator.get('selection:rootelement');
            var canvasBody = mediator.get('canvas:body');
            this.injectHooks(rootElement);

            var rangeCoordinates = mediator.get('selection:range:coordinates');
            var clonedNodes = this.cloneNodes(rootElement);
            mediator.exec('canvas:content', clonedNodes);
            mediator.exec('canvas:select:by:coordinates', rangeCoordinates);

            this.removeZeroWidthSpaces(canvasBody);
        },
        cloneNodes: function cloneNodes(rootElement) {
            var clonedNodes = [];
            rootElement.childNodes.forEach(function (node) {
                clonedNodes.push(node.cloneNode(true));
            });
            return clonedNodes;
        },
        injectHooks: function injectHooks(rootElement) {
            while (!/\w+/.test(rootElement.firstChild.textContent)) {
                DOM.removeNode(rootElement.firstChild);
            }

            while (!/\w+/.test(rootElement.lastChild.textContent)) {
                DOM.removeNode(rootElement.lastChild);
            }

            DOM.insertBefore(zeroWidthSpace.get(), rootElement.firstChild);
            DOM.insertAfter(zeroWidthSpace.get(), rootElement.lastChild);
        },
        importFromCanvas: function importFromCanvas() {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var mediator = this.mediator;

            var canvasBody = mediator.get('canvas:body');

            mediator.exec('canvas:cache:selection');
            mediator.exec('format:clean', canvasBody);
            if (opts.importFilter) {
                opts.importFilter(canvasBody);
            }
            mediator.exec('canvas:select:cachedSelection');

            var canvasSelectionCoordinates = mediator.get('canvas:selection:coordinates');
            mediator.exec('selection:select:all');
            mediator.exec('contenteditable:inserthtml', canvasBody.innerHTML);
            mediator.exec('selection:select:coordinates', canvasSelectionCoordinates);

            mediator.emit('import:from:canvas:complete');
        },
        formatDefault: function formatDefault() {
            var mediator = this.mediator;

            var rootElem = mediator.get('selection:rootelement');
            commands.defaultBlockFormat();
            this.removeStyledSpans(rootElem);
        },
        formatEmptyNewLine: function formatEmptyNewLine() {
            var mediator = this.mediator;

            var anchorNode = mediator.get('selection:anchornode');
            var canDefaultNewline = !(anchorNode.innerText && anchorNode.innerText.trim().length) && !DOM.isIn(anchorNode, Toolbar$2.preventNewlineDefault);
            var anchorIsContentEditable = anchorNode.hasAttribute && anchorNode.hasAttribute('contenteditable');

            if (canDefaultNewline || anchorIsContentEditable) {
                this.formatDefault();
            }
        },
        formateBlockquoteNewLine: function formateBlockquoteNewLine() {
            var mediator = this.mediator;


            commands.exec('outdent');
            this.formatDefault();

            var currentRangeClone = mediator.get('selection:range').cloneRange();
            var startContainer = currentRangeClone.startContainer;


            if (startContainer.previousSibling && startContainer.previousSibling.nodeName === 'BLOCKQUOTE') {
                var brEls = startContainer.previousSibling.querySelectorAll('br');
                var divEls = startContainer.previousSibling.querySelectorAll('div');

                for (var i = 0; i < brEls.length; i++) {
                    DOM.removeNode(brEls[i]);
                }

                for (var _i = 0; _i < divEls.length; _i++) {
                    DOM.unwrap(divEls[_i]);
                }

                mediator.exec('selection:update:range', currentRangeClone);
            }
        },
        handleNewLine: function handleNewLine() {
            var mediator = this.mediator;

            var _mediator$get = mediator.get('selection:range'),
                startContainer = _mediator$get.startContainer;

            var containerIsEmpty = !/\w+/.test(startContainer.textContent);
            var containerIsBlockquote = DOM.isIn(startContainer, 'BLOCKQUOTE');
            var isContentEditable = startContainer.nodeType === Node.ELEMENT_NODE && startContainer.hasAttribute('contenteditable');

            if (containerIsBlockquote) {
                this.formateBlockquoteNewLine();
            } else if (containerIsEmpty || isContentEditable) {
                this.formatEmptyNewLine();
            }
        },
        formatClean: function formatClean(rootElem) {
            this.unwrapInvalidElements(rootElem);
            this.defaultOrphanedTextNodes(rootElem);
            this.removeBrNodes(rootElem);
            this.ensureRootElems(rootElem);
            this.removeStyleAttributes(rootElem);
            this.removeEmptyNodes(rootElem, { recursive: true });

            // -----

            // this.removeBrNodes(rootElem);
            // // this.removeEmptyNodes(rootElem);
            // this.removeFontTags(rootElem);
            // this.removeStyledSpans(rootElem);
            // this.clearEntities(rootElem);
            // this.removeZeroWidthSpaces(rootElem);
            // this.defaultOrphanedTextNodes(rootElem);
            // this.removeEmptyNodes(rootElem, { recursive: true });
        },
        removeStyleAttributes: function removeStyleAttributes(rootElem) {
            var styleAttributeNodes = rootElem.querySelectorAll('[style]');
            styleAttributeNodes.forEach(function (styleAttributeNode) {
                styleAttributeNode.removeAttribute('style');
            });
        },
        removeBrNodes: function removeBrNodes(rootElem) {
            var brNodes = rootElem.querySelectorAll('br');
            var brNodesToProcess = [];
            var brNodesToRemove = [];

            brNodes.forEach(function (brNode) {
                var skipNode = brNode.skipNode;

                if (skipNode) {
                    return;
                }

                var isLastChild = brNode === brNode.parentNode.lastChild;
                var isDoubleBreak = brNode.nextSibling && brNode.nextSibling.nodeName === 'BR';
                var isInBlock = DOM.isIn(brNode, blockTags, rootElem);

                if (isLastChild) {
                    brNodesToRemove.push(isLastChild);
                    return;
                }

                if (isDoubleBreak && isInBlock) {
                    brNodesToProcess.push([brNode, brNode.nextSibling]);
                    brNode.nextSibling.skipNode = true;
                    return;
                }
            });

            brNodesToProcess.forEach(function (brNodePair) {
                var _brNodePair = slicedToArray(brNodePair, 2),
                    firstBrNode = _brNodePair[0],
                    secondBrNode = _brNodePair[1];

                var closestBlock = DOM.getClosestInArray(firstBrNode, blockTags, rootElem);
                var newParagraph = document.createElement('p');
                var previousSibling = void 0;

                while (previousSibling = firstBrNode.previousSibling) {
                    if (newParagraph.firstChild) {
                        DOM.insertBefore(previousSibling, newParagraph.firstChild);
                    } else {
                        newParagraph.appendChild(previousSibling);
                    }

                    DOM.insertBefore(newParagraph, closestBlock);
                }

                DOM.removeNode(firstBrNode);
                DOM.removeNode(secondBrNode);
            });

            brNodesToRemove.forEach(function (brNode) {
                DOM.removeNode(brNode);
            });
        },
        unwrapInvalidElements: function unwrapInvalidElements(rootElem) {
            var rootDoc = rootElem.ownerDocument;
            var walker = rootDoc.createTreeWalker(rootElem, NodeFilter.SHOW_ELEMENT, null, false);

            var invalidElements = [];
            while (walker.nextNode()) {
                var currentNode = walker.currentNode;

                var isInvalid = validTags.indexOf(currentNode.nodeName) < 0;
                var isBrNode = currentNode.nodeName === 'BR'; // BR nodes are handled elsewhere
                var isTypesterElem = currentNode.className && /typester/.test(currentNode.className);

                if (isInvalid && !isBrNode && !isTypesterElem) {
                    invalidElements.unshift(currentNode);
                }
            }

            invalidElements.forEach(function (invalidElement) {
                var unwrappedNodes = DOM.unwrap(invalidElement, { keepNode: true });
                if (!DOM.isIn(invalidElement, validTags, rootElem) && unwrappedNodes.length) {
                    var newParagraph = rootDoc.createElement('p');
                    unwrappedNodes.forEach(function (unwrappedNode) {
                        newParagraph.appendChild(unwrappedNode);
                    });
                    DOM.insertBefore(newParagraph, invalidElement);
                }
                DOM.removeNode(invalidElement);
            });
        },
        defaultOrphanedTextNodes: function defaultOrphanedTextNodes(rootElem) {
            var childNodes = rootElem.childNodes;

            for (var i = 0; i < childNodes.length; i++) {
                var childNode = childNodes[i];
                if (childNode.nodeType === Node.TEXT_NODE && /\w+/.test(childNode.textContent)) {
                    var newParagraph = document.createElement('p');
                    DOM.insertBefore(newParagraph, childNode);
                    newParagraph.appendChild(childNode);
                    while (newParagraph.nextSibling && blockTags.concat(listTags).indexOf(newParagraph.nextSibling.nodeName) < 0) {
                        newParagraph.appendChild(newParagraph.nextSibling);
                    }
                }
            }
        },
        clearEntities: function clearEntities(rootElem) {
            var rootDoc = rootElem.ownerDocument;
            var walker = rootDoc.createTreeWalker(rootElem, NodeFilter.SHOW_TEXT, null, false);

            var textNodes = [];
            while (walker.nextNode()) {
                textNodes.push(walker.currentNode);
            }

            textNodes.forEach(function (textNode) {
                if (/\w+/.test(textNode.textContent)) {
                    textNode.nodeValue = textNode.nodeValue.replace(/^\u00a0/, '');
                    textNode.nodeValue = textNode.nodeValue.replace(/\u00a0$/, '');
                }
            });
        },
        ensureRootElems: function ensureRootElems(rootElem) {
            var rootNodeTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'OL', 'UL', 'BLOCKQUOTE', 'P'];
            var nestableTags = [{
                tags: ['OL', 'UL'],
                validParents: ['OL', 'UL', 'LI']
            }, {
                tags: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
                validParents: ['LI']
            }];
            var rootNodes = rootElem.querySelectorAll(rootNodeTags.join(', '));
            var validNesting = function validNesting(node) {
                var validNesting = false;
                nestableTags.forEach(function (nestingDict) {
                    if (nestingDict.tags.indexOf(node.tagName) > -1 && nestingDict.validParents.indexOf(node.parentNode.tagName) > -1) {
                        validNesting = true;
                    }
                });
                return validNesting;
            };

            var moveNodeToRoot = function moveNodeToRoot(node) {
                if (node.parentNode === rootElem) {
                    return;
                }

                if (validNesting(node)) {
                    return;
                }

                var rootParentNode = node.parentNode;
                if (node.tagName === 'P' && ['LI', 'BLOCKQUOTE'].indexOf(rootParentNode.tagName) > -1) {
                    while (node.firstChild) {
                        DOM.insertBefore(node.firstChild, node);
                    }
                    DOM.removeNode(node);
                    return;
                }

                while (rootParentNode.parentNode !== rootElem) {
                    rootParentNode = rootParentNode.parentNode;
                }

                DOM.insertBefore(node, rootParentNode);
            };

            rootNodes.forEach(moveNodeToRoot);
        },
        removeZeroWidthSpaces: function removeZeroWidthSpaces(rootElem) {
            rootElem.childNodes.forEach(function (childNode) {
                if (childNode.nodeType === Node.TEXT_NODE && zeroWidthSpace.assert(childNode)) {
                    DOM.removeNode(childNode);
                }
            });
        },
        removeEmptyNodes: function removeEmptyNodes(rootElem) {
            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            if (rootElem.normalize) {
                rootElem.normalize();
            }

            for (var i = rootElem.childNodes.length - 1; i >= 0; i--) {
                var childNode = rootElem.childNodes[i];

                if (childNode.nodeName === 'BR') {
                    continue;
                }

                if (opts.recursive && childNode.childNodes.length) {
                    this.removeEmptyNodes(childNode, { recursive: true, rootIsChild: true });
                }

                if (!/[\w\.,\/#!$%\^&\*;:{}=\-_`~()\'\"]/.test(childNode.textContent)) {
                    if (!opts.rootIsChild && !zeroWidthSpace.assert(childNode) && i > 0 || childNode.nodeType === Node.ELEMENT_NODE) {
                        DOM.removeNode(childNode);
                    }
                }
            }
        },
        removeStyledSpans: function removeStyledSpans(rootElem) {
            var styledSpans = rootElem.querySelectorAll('span[style]');
            for (var i = styledSpans.length - 1; i >= 0; i--) {
                var styledSpan = styledSpans[i];
                while (styledSpan.firstChild) {
                    DOM.insertBefore(styledSpan.firstChild, styledSpan);
                }
                DOM.removeNode(styledSpan);
            }
        },
        removeFontNodes: function removeFontNodes(rootElem) {
            var fontTags = rootElem.querySelectorAll('font');
            for (var i = fontTags.length - 1; i >= 0; i--) {
                var fontTag = fontTags[i];
                while (fontTag.firstChild) {
                    DOM.insertBefore(fontTag.firstChild, fontTag);
                }
                DOM.removeNode(fontTag);
            }
        }
    }
});

// jshint strict: false

/**
* @access protected
*/
var BlockFormatter = Module({
    name: 'BlockFormatter',
    props: {
        selectionRootEl: null
    },
    handlers: {
        commands: {
            'format:block': 'formatBlock'
        },
        events: {}
    },
    methods: {
        init: function init() {},
        formatBlock: function formatBlock(opts) {
            this.preProcess(opts);
            this.process(opts);
            this.commit(opts);
        },
        preProcess: function preProcess() {
            var mediator = this.mediator;

            mediator.exec('format:export:to:canvas');
        },
        process: function process(opts) {
            var mediator = this.mediator;

            var canvasDoc = mediator.get('canvas:document');

            if (opts.toggle) {
                if (opts.style === 'BLOCKQUOTE') {
                    commands.exec('outdent', null, canvasDoc);
                }
                commands.defaultBlockFormat(canvasDoc);
            } else {
                commands.formatBlock(opts.style, canvasDoc);
            }
        },
        commit: function commit(opts) {
            var mediator = this.mediator,
                cleanupBlockquote = this.cleanupBlockquote;

            var importFilter = opts.style === 'BLOCKQUOTE' ? cleanupBlockquote : null;
            mediator.exec('format:import:from:canvas', { importFilter: importFilter });
        },
        cleanupBlockquote: function cleanupBlockquote(rootElem) {
            var blockquoteParagraphs = rootElem.querySelectorAll('BLOCKQUOTE P');
            blockquoteParagraphs.forEach(function (paragraph) {
                DOM.unwrap(paragraph);
            });
        }
    }
});

// jshint strict: false

/**
* @access protected
*/
var TextFormatter = Module({
    name: 'TextFormatter',
    props: {
        cachedRange: null
    },
    handlers: {
        requests: {},
        commands: {
            'format:text': 'formatText'
        },
        events: {}
    },
    methods: {
        formatText: function formatText(opts) {
            this.preProcess();
            this.process(opts);
            this.postProcess();
        },
        preProcess: function preProcess() {
            var mediator = this.mediator;

            mediator.exec('contenteditable:refocus');
            mediator.exec('selection:reselect');
        },
        process: function process(opts) {
            commands.exec(opts.style, null);
        },
        postProcess: function postProcess() {
            var mediator = this.mediator;


            mediator.exec('contenteditable:refocus');
            // mediator.exec('selection:reselect');
        }
    }
});

// jshint strict: false

/**
* @access protected
*/
var ListFormatter = Module({
    name: 'ListFormatter',
    props: {},
    dom: {},
    handlers: {
        requests: {},
        commands: {
            'format:list': 'formatList',
            'format:list:cleanup': 'cleanupListDOM'
        },
        events: {
            'contenteditable:tab:down': 'handleTabDown',
            'contenteditable:tab:up': 'handleTabUp'
        }
    },
    methods: {
        init: function init() {},
        formatList: function formatList(opts) {
            this.preProcess(opts);
            this.process(opts);
            this.commit(opts);
        },
        preProcess: function preProcess() {
            var mediator = this.mediator;

            mediator.exec('format:export:to:canvas');
        },
        process: function process(opts) {
            var mediator = this.mediator;

            var canvasDoc = mediator.get('canvas:document');
            var toggle = false;

            mediator.exec('canvas:cache:selection');
            switch (opts.style) {
                case 'ordered':
                    toggle = mediator.get('selection:in:or:contains', ['OL']);
                    if (toggle) {
                        // this.prepListItemsForToggle();
                        // while (mediator.get('canvas:selection:in:or:contains', ['OL'])) {
                        //     commands.exec('outdent', null, canvasDoc);
                        // }
                        // commands.exec('insertOrderedList', null, canvasDoc);
                        // return;
                    } else if (mediator.get('selection:in:or:contains', ['UL'])) {
                        commands.exec('insertUnorderedList', null, canvasDoc);
                    }
                    commands.exec('insertOrderedList', null, canvasDoc);
                    break;
                case 'unordered':
                    toggle = mediator.get('selection:in:or:contains', ['UL']);
                    
                    if (mediator.get('selection:in:or:contains', ['OL'])) {
                        commands.exec('insertOrderedList', null, canvasDoc);
                    }
                    commands.exec('insertUnorderedList', null, canvasDoc);
                    break;
                case 'outdent':
                    commands.exec('outdent', null, canvasDoc);
                    break;
                case 'indent':
                    commands.exec('indent', null, canvasDoc);
                    break;
            }

            if (toggle) {
                // mediator.exec('canvas:select:cachedSelection');
                this.postProcessToggle(opts);
            } else {
                mediator.exec('canvas:select:ensure:offsets');
            }

            // mediator.exec('canvas:select:cachedSelection');
        },
        commit: function commit() {
            var mediator = this.mediator,
                cleanupListDOM = this.cleanupListDOM;

            mediator.exec('format:import:from:canvas', {
                importFilter: cleanupListDOM
            });
        },
        handleTabDown: function handleTabDown(evnt) {
            var mediator = this.mediator;

            var isInList = mediator.get('selection:in:or:contains', ['UL', 'OL']);

            if (isInList) {
                evnt.preventDefault();
            }
        },
        handleTabUp: function handleTabUp(evnt) {
            var mediator = this.mediator;

            var isInList = mediator.get('selection:in:or:contains', ['UL', 'OL']);

            if (isInList) {
                evnt.preventDefault();

                
            }
        },
        prepListItemsForToggle: function prepListItemsForToggle() {
            var mediator = this.mediator;


            var canvasDoc = mediator.get('canvas:document');
            var canvasBody = mediator.get('canvas:body');

            var _mediator$get = mediator.get('canvas:selection'),
                anchorNode = _mediator$get.anchorNode,
                focusNode = _mediator$get.focusNode;

            var anchorLiNode = DOM.getClosest(anchorNode, 'LI', canvasBody);
            var focusLiNode = DOM.getClosest(focusNode, 'LI', canvasBody);

            mediator.exec('canvas:cache:selection');

            var selectedLiNodes = [anchorLiNode];
            var nextLiNode = anchorLiNode.nextSibling;
            while (nextLiNode && nextLiNode !== focusLiNode) {
                selectedLiNodes.push(nextLiNode);
                nextLiNode = nextLiNode.nextSibling;
            }
            selectedLiNodes.push(focusLiNode);

            selectedLiNodes.forEach(function (selectedLiNode) {
                var contentWrapper = canvasDoc.createElement('span');
                selectedLiNode.appendChild(contentWrapper);
                while (selectedLiNode.firstChild !== contentWrapper) {
                    contentWrapper.appendChild(selectedLiNode.firstChild);
                }
            });

            mediator.exec('canvas:select:cachedSelection');

            return;
            // const canvasBody = mediator.get('canvas:body');
            // const canvasDoc = mediator.get('canvas:document');
            //
            // let rootBlock = anchorNode;
            // while(rootBlock.parentNode !== canvasBody) {
            //     rootBlock = rootBlock.parentNode;
            // }
            //
            // const liNodes = rootBlock.querySelectorAll('li');
            // liNodes.forEach((liNode) => {
            //     let pNode = canvasDoc.createElement('span');
            //     liNode.appendChild(pNode);
            //     while (liNode.firstChild !== pNode) {
            //         pNode.appendChild(liNode.firstChild);
            //     }
            // });
        },
        postProcessToggle: function postProcessToggle() {
            var mediator = this.mediator;
            // return;

            var canvasDoc = mediator.get('canvas:document');
            var canvasBody = mediator.get('canvas:body');

            mediator.exec('canvas:cache:selection');

            var _mediator$get2 = mediator.get('canvas:selection'),
                anchorNode = _mediator$get2.anchorNode,
                focusNode = _mediator$get2.focusNode;

            var walkToRoot = function walkToRoot(node) {
                var rootNode = node;
                while (rootNode.parentNode !== canvasBody) {
                    rootNode = rootNode.parentNode;
                }
                return rootNode;
            };

            var anchorRootNode = walkToRoot(anchorNode);
            var focusRootNode = walkToRoot(focusNode);

            var currentNode = anchorRootNode;
            var currentParagraph = void 0;

            var createParagraph = function createParagraph() {
                currentParagraph = canvasDoc.createElement('p');
                DOM.insertBefore(currentParagraph, currentNode);
            };

            var handleBrNode = function handleBrNode(brNode) {
                createParagraph();
                currentNode = brNode.nextSibling;
                DOM.removeNode(brNode);
            };

            var handleDivNode = function handleDivNode(divNode) {
                createParagraph();
                currentNode = divNode.nextSibling;
                while (divNode.firstChild) {
                    currentParagraph.appendChild(divNode.firstChild);
                }
                DOM.removeNode(divNode);
            };

            createParagraph();

            while (currentNode !== focusRootNode) {
                if (currentNode.nodeName === 'BR') {
                    handleBrNode(currentNode);
                } else if (currentNode.nodeName === 'DIV') {
                    handleDivNode(currentNode);
                } else {
                    var orphanedNode = currentNode;
                    currentNode = currentNode.nextSibling;
                    currentParagraph.appendChild(orphanedNode);
                }
            }

            if (focusRootNode.nodeName === 'DIV') {
                handleDivNode(focusRootNode);
            } else {
                currentParagraph.appendChild(focusRootNode);
            }

            mediator.exec('canvas:select:cachedSelection');
        },
        cleanupListDOM: function cleanupListDOM(rootElem) {
            var listContainers = rootElem.querySelectorAll('OL, UL');

            for (var i = listContainers.length - 1; i >= 0; i--) {
                var listContainer = listContainers[i];
                if (['OL', 'UL'].indexOf(listContainer.parentNode.nodeName) > -1) {
                    if (listContainer.previousSibling) {
                        if (listContainer.previousSibling.nodeName === 'LI') {
                            listContainer.previousSibling.appendChild(listContainer);
                        }

                        if (['OL', 'UL'].indexOf(listContainer.previousSibling.nodeName) > -1) {
                            for (var j = 0; j <= listContainer.childNodes.length; j++) {
                                listContainer.previousSibling.appendChild(listContainer.childNodes[j]);
                            }
                            DOM.removeNode(listContainer);
                        }
                    } else {
                        DOM.unwrap(listContainer);
                    }
                } else {
                    while (listContainer.parentNode && listContainer.parentNode !== rootElem && ['LI'].indexOf(listContainer.parentNode.nodeName) < 0) {
                        DOM.insertBefore(listContainer, listContainer.parentNode);
                    }
                }
            }

            var nestedListItems = rootElem.querySelectorAll('LI > LI');
            for (var _i = nestedListItems.length - 1; _i >= 0; _i--) {
                var nestedListItem = nestedListItems[_i];
                DOM.insertAfter(nestedListItem, nestedListItem.parentNode);
            }
        }
    }
});

var Template$6 = runtime.template({ "compiler": [7, ">= 4.0.0"], "main": function main(container, depth0, helpers, partials, data) {
    var helper;

    return "<form class='typester-input-form'>\n    <input type='text' name='user-input' class='user-input' value='" + container.escapeExpression((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, { "name": "value", "hash": {}, "data": data }) : helper)) + "' />\n    <button type='submit'>\n        <svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n             viewBox=\"0 180 20 20\" enable-background=\"new 0 180 20 20\" xml:space=\"preserve\" height=\"20px\" width=\"20px\">\n             <polyline class=\"checkmark-2\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"5.3\" stroke-miterlimit=\"10\" points=\"1.9,188.8 7.5,194.4 18.1,183.9 \"/>\n        </svg>\n    </button>\n    <button type='cancel'>\n        <svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n             viewBox=\"0 0 20 20\" enable-background=\"new 0 0 20 20\" xml:space=\"preserve\" width=\"20px\" height=\"20px\">\n             <path id=\"XMLID_730_\" d=\"M16.4,19.8c-0.2,0.2-0.5,0.2-0.6,0L10,14l-5.7,5.7c-0.2,0.2-0.5,0.2-0.6,0l-3.4-3.4c-0.2-0.2-0.2-0.5,0-0.6\n            L6,10L0.2,4.3c-0.2-0.2-0.2-0.5,0-0.6l3.4-3.4c0.2-0.2,0.5-0.2,0.6,0L10,6l5.7-5.7c0.2-0.2,0.5-0.2,0.6,0l3.4,3.4\n            c0.2,0.2,0.2,0.5,0,0.6L14,10l5.7,5.7c0.2,0.2,0.2,0.5,0,0.6L16.4,19.8z\"/>\n        </svg>\n    </button>\n</form>\n";
  }, "useData": true });
var inputFormTemplate = function (data, options, asString) {
  var html = Template$6(data, options);
  return asString || typeof $ === 'undefined' ? html : $(html);
};

var Template$7 = runtime.template({ "compiler": [7, ">= 4.0.0"], "main": function main(container, depth0, helpers, partials, data) {
    var helper;

    return "<div class='typester-link-display'>\n    <a>" + container.escapeExpression((helper = (helper = helpers.href || (depth0 != null ? depth0.href : depth0)) != null ? helper : helpers.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, { "name": "href", "hash": {}, "data": data }) : helper)) + "</a>\n</div>\n";
  }, "useData": true });
var linkDisplayTemplate = function (data, options, asString) {
  var html = Template$7(data, options);
  return asString || typeof $ === 'undefined' ? html : $(html);
};

var inputFormStyles = ".typester-input-form input[type=text] {\n  background: none;\n  border: none;\n  padding: 5px 15px;\n  height: 30px;\n  color: #FFF;\n  width: 250px;\n  outline: none;\n  vertical-align: top; }\n\n.typester-input-form button {\n  height: 40px;\n  width: 40px;\n  line-height: 40px;\n  background: none;\n  border: none;\n  color: #FFF;\n  cursor: pointer;\n  outline: none;\n  text-align: center;\n  padding: 0;\n  margin: 0;\n  vertical-align: top; }\n  .typester-input-form button:hover {\n    background: #00aeef; }\n  .typester-input-form button svg {\n    display: block;\n    height: 16px;\n    width: 16px;\n    margin: 12px;\n    fill: #FFF;\n    stroke: #FFF;\n    text-align: center; }\n\n.typester-link-display a {\n  display: block;\n  cursor: pointer;\n  line-height: 20px;\n  padding: 10px; }\n";

// jshint strict: false

/**
* @access protected
*/
var LinkFormatter = Module({
    name: 'LinkFormatter',
    props: {
        urlRegex: /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
        styles: null,
        currentAnchor: null,
        active: false,
        hasMouse: false,
        showing: null,
        hideTimeout: null,
        initialEvent: null,
        targetEl: null,
        hasRendered: null
    },
    dom: {
        'userInput': '.user-input'
    },
    handlers: {
        requests: {
            'format:link:active': 'isActive'
        },
        commands: {
            'format:link': 'formatLink'
        },
        events: {
            'app:destroy': 'destroy',
            'contenteditable:mouseover:anchor': 'showLinkFlyout',
            'contenteditable:mouseout:anchor': 'hideFlyout',
            'selection:update': 'handleSelectionChange',
            'selection:change': 'handleSelectionChange',
            'contenteditable:blur': 'handleContentEditableBlur'
        },
        domEvents: {
            'submit': 'handleSubmit',
            'click': 'handleClick',
            'mouseover': 'handleMouseOver',
            'mouseout': 'handleMouseOut'
        }
    },
    methods: {
        setup: function setup() {
            this.appendStyles();
        },
        appendStyles: function appendStyles() {
            var props = this.props;

            props.styles = DOM.addStyles(inputFormStyles);
        },
        formatLink: function formatLink() {
            if (this.isInLink()) {
                this.removeLink();
            } else {
                this.showLinkFormFlyout();
            }
        },
        isInLink: function isInLink() {
            var mediator = this.mediator;

            return mediator.get('selection:in:or:contains', ['A']);
        },
        showLinkFormFlyout: function showLinkFormFlyout(data) {
            var mediator = this.mediator,
                props = this.props;

            var linkForm = this.compileLinkForm(data);

            props.showing = 'linkForm';
            this.render({ content: linkForm });
            mediator.exec('selection:wrap:pseudo');
            this.focusInput();
            this.bindInput();
        },
        showLinkFlyout: function showLinkFlyout(evnt) {
            var props = this.props,
                mediator = this.mediator;

            var anchor = DOM.getClosest(evnt.target, 'A');

            if (mediator.get('selection:contains:node', anchor) || props.showing === 'linkForm') {
                return;
            }

            this.clearHideTimeout();

            var linkDisplay = this.compileLinkDisplay({ href: anchor.href });

            props.initialEvent = evnt;
            props.targetEl = anchor;
            this.render({
                content: linkDisplay,
                flyoutPlacement: 'below'
            });
            props.showing = 'linkDisplay';
            props.currentAnchor = anchor;
        },
        hideFlyout: function hideFlyout() {
            var _this = this;

            var props = this.props;

            props.hideTimeout = setTimeout(function () {
                if (!_this.isActive() && props.hasRendered) {
                    _this.destroy();
                }
            }, 350);
        },
        clearHideTimeout: function clearHideTimeout() {
            var props = this.props;

            if (props.hideTimeout) {
                clearTimeout(props.hideTimeout);
                props.hideTimeout = null;
            }
        },
        compileLinkForm: function compileLinkForm(data) {
            var wrapperEl = document.createElement('div');
            var inputFormHTML = inputFormTemplate(data);

            if (typeof inputFormHTML === 'string') {
                wrapperEl.innerHTML = inputFormHTML;
            } else {
                wrapperEl.appendChild(inputFormHTML[0]);
            }

            return wrapperEl.childNodes[0];
        },
        compileLinkDisplay: function compileLinkDisplay(data) {
            var wrapperEl = document.createElement('div');
            var inputFormHTML = linkDisplayTemplate(data);

            if (typeof inputFormHTML === 'string') {
                wrapperEl.innerHTML = inputFormHTML;
            } else {
                wrapperEl.appendChild(inputFormHTML[0]);
            }

            return wrapperEl.childNodes[0];
        },
        render: function render(opts) {
            var mediator = this.mediator,
                props = this.props;


            props.hasMouse = false;
            props.flyout = props.flyout || mediator.get('flyout:new');
            props.flyout.clearContent();
            props.flyout.setPlacement(opts.flyoutPlacement);
            props.flyout.appendContent(opts.content);

            this.positionFlyout(opts);
            this.showFlyout();

            props.hasRendered = true;
            return props.flyout.el;
        },
        positionFlyout: function positionFlyout(opts) {
            var mediator = this.mediator,
                props = this.props;
            var initialEvent = props.initialEvent,
                targetEl = props.targetEl;

            var targetBounds = void 0,
                elStyles = void 0,
                elLineHeight = void 0,
                lineCount = void 0,
                lineStepHeight = void 0;

            if (targetEl) {
                targetBounds = targetEl.getBoundingClientRect();
                elStyles = window.getComputedStyle(targetEl);
                elLineHeight = parseInt(elStyles.getPropertyValue('line-height'), 10);
                lineCount = Math.ceil(targetBounds.height / elLineHeight);
                lineStepHeight = targetBounds.height / lineCount;
            } else {
                targetBounds = mediator.get('selection:bounds');
            }

            if (targetBounds.width > 0) {
                var scrollOffset = DOM.getScrollOffset();
                var docRelTop = void 0,
                    docRelCenter = void 0;

                if (initialEvent) {
                    var topDiff = initialEvent.clientY - targetBounds.top;

                    docRelTop = initialEvent.clientY;
                    docRelCenter = initialEvent.clientX;

                    if (opts.flyoutPlacement === 'below') {
                        docRelTop = targetBounds.top + lineStepHeight * Math.ceil(topDiff / lineStepHeight);
                    } else {
                        docRelTop = targetBounds.top + lineStepHeight * Math.floor(topDiff / lineStepHeight);
                    }
                } else {
                    docRelTop = opts.flyoutPlacement === 'below' ? targetBounds.bottom : targetBounds.top;
                    docRelCenter = targetBounds.width / 2 + targetBounds.left + scrollOffset.x;
                }

                docRelTop += scrollOffset.y;

                props.flyout.position({
                    left: docRelCenter + 'px',
                    top: docRelTop + 'px'
                });
            }
        },
        showFlyout: function showFlyout() {
            var mediator = this.mediator,
                props = this.props;

            props.flyout.show();
            mediator.exec('toolbar:hide');
        },
        focusInput: function focusInput() {
            var dom = this.dom;

            dom.userInput[0].focus();
        },
        bindInput: function bindInput() {
            var dom = this.dom,
                props = this.props;

            dom.userInput[0].addEventListener('blur', this.handleBlur);
            props.userInputBound = true;
        },
        unbindInput: function unbindInput() {
            var dom = this.dom,
                props = this.props;

            if (props.userInputBound) {
                props.userInputBound = false;
                dom.userInput[0].removeEventListener('blur', this.handleBlur);
            }
        },
        handleSubmit: function handleSubmit(evnt) {
            evnt.preventDefault();
            var formJSON = this.processForm();
            if (formJSON['user-input']) {
                this.createLink(formJSON);
            } else {
                this.removeLink({ byPseudo: true });
            }
        },
        handleClick: function handleClick(evnt) {
            var mediator = this.mediator,
                props = this.props;

            if (evnt.target.nodeName === 'A') {
                evnt.preventDefault();
                mediator.exec('selection:wrap:element', props.currentAnchor, { silent: true });
                this.showLinkFormFlyout({ value: props.currentAnchor.href });
            }
        },
        handleMouseOver: function handleMouseOver() {
            var props = this.props;

            props.hasMouse = true;
        },
        handleMouseOut: function handleMouseOut() {
            var props = this.props;

            props.hasMouse = false;

            if (props.showing === 'linkDisplay') {
                this.hideFlyout();
            }
        },
        handleBlur: function handleBlur() {
            var _this2 = this;

            var props = this.props;

            if (props.blurTimeout) {
                clearTimeout(props.blurTimeout);
            }

            props.blurTimeout = setTimeout(function () {
                _this2.hideFlyout();
            }, 100);
        },
        handleSelectionChange: function handleSelectionChange() {
            if (!this.isActive()) {
                this.hideFlyout();
            }
        },
        handleContentEditableBlur: function handleContentEditableBlur() {
            this.hideFlyout();
        },
        isActive: function isActive() {
            var props = this.props,
                dom = this.dom;

            return props.hasMouse || dom && document.activeElement === dom.userInput[0] || props.showingLinkFlyout;
        },
        processForm: function processForm() {
            var dom = this.dom;

            var formInputs = dom.el[0].querySelectorAll('input, select, textarea');
            var formJSON = {};

            for (var i = 0; i < formInputs.length; i++) {
                var inputEl = formInputs[i];
                var inputName = inputEl.name;
                var inputValue = inputEl.value;

                if (inputName) {
                    formJSON[inputName] = inputValue;
                }
            }

            return formJSON;
        },
        processLinkInput: function processLinkInput(linkInput) {
            var props = this.props;


            if (props.urlRegex.test(linkInput) && linkInput.indexOf('//') < 0) {
                linkInput = 'http://' + linkInput;
            }

            return linkInput;
        },
        createLink: function createLink(formJSON) {
            var mediator = this.mediator;


            if (formJSON['user-input']) {
                var linkURL = this.processLinkInput(formJSON['user-input']);
                mediator.exec('selection:select:pseudo');
                commands.exec('unlink');
                commands.exec('createLink', linkURL);
            }

            this.destroy();
        },
        removeLink: function removeLink() {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var mediator = this.mediator;


            if (opts.byPseudo) {
                mediator.exec('selection:select:pseudo');
            } else {
                var anchorNode = mediator.get('selection:anchornode');
                var anchor = DOM.getClosest(anchorNode, 'A');
                mediator.exec('selection:wrap:element', anchor);
            }

            commands.exec('unlink');
            this.destroy();
        },
        destroy: function destroy() {
            var props = this.props,
                mediator = this.mediator;

            if (props.flyout) {
                this.unbindInput();
                props.flyout.remove();
            }
            props.showing = null;
            props.hasMouse = false;
            props.hasRendered = null;
            mediator.exec('selection:select:remove:pseudo');
        }
    }
});

var purify = createCommonjsModule(function (module, exports) {
(function (global, factory) {
	module.exports = factory();
}(commonjsGlobal, (function () { 'use strict';

var html = ['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr'];

// SVG
var svg = ['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'audio', 'canvas', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'video', 'view', 'vkern'];

var svgFilters = ['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'feSpecularLighting', 'feTile', 'feTurbulence'];

var mathMl = ['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmuliscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mpspace', 'msqrt', 'mystyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover'];

var text = ['#text'];

var html$1 = ['accept', 'action', 'align', 'alt', 'autocomplete', 'background', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'coords', 'datetime', 'default', 'dir', 'disabled', 'download', 'enctype', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'ismap', 'label', 'lang', 'list', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'multiple', 'name', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'span', 'srclang', 'start', 'src', 'step', 'style', 'summary', 'tabindex', 'title', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns'];

var svg$1 = ['accent-height', 'accumulate', 'additivive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'tabindex', 'targetx', 'targety', 'transform', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan'];

var mathMl$1 = ['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns'];

var xml = ['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink'];

/* Add properties to a lookup table */
function addToSet(set, array) {
  var l = array.length;
  while (l--) {
    if (typeof array[l] === 'string') {
      array[l] = array[l].toLowerCase();
    }
    set[array[l]] = true;
  }
  return set;
}

/* Shallow clone an object */
function clone(object) {
  var newObject = {};
  var property = void 0;
  for (property in object) {
    if (Object.prototype.hasOwnProperty.call(object, property)) {
      newObject[property] = object[property];
    }
  }
  return newObject;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var getGlobal = function getGlobal() {
  return typeof window === 'undefined' ? null : window;
};

function createDOMPurify() {
  var window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();

  var DOMPurify = function DOMPurify(root) {
    return createDOMPurify(root);
  };

  /**
      * Version label, exposed for easier checks
      * if DOMPurify is up to date or not
      */
  DOMPurify.version = '1.0.2';

  /**
    * Array of elements that DOMPurify removed during sanitation.
    * Empty if nothing was removed.
    */
  DOMPurify.removed = [];

  if (!window || !window.document || window.document.nodeType !== 9) {
    // Not running in a browser, provide a factory function
    // so that you can pass your own Window
    DOMPurify.isSupported = false;

    return DOMPurify;
  }

  var originalDocument = window.document;
  var useDOMParser = false; // See comment below
  var useXHR = false;

  var document = window.document;
  var DocumentFragment = window.DocumentFragment,
      HTMLTemplateElement = window.HTMLTemplateElement,
      Node = window.Node,
      NodeFilter = window.NodeFilter,
      _window$NamedNodeMap = window.NamedNodeMap,
      NamedNodeMap = _window$NamedNodeMap === undefined ? window.NamedNodeMap || window.MozNamedAttrMap : _window$NamedNodeMap,
      Text = window.Text,
      Comment = window.Comment,
      DOMParser = window.DOMParser,
      _window$XMLHttpReques = window.XMLHttpRequest,
      XMLHttpRequest = _window$XMLHttpReques === undefined ? window.XMLHttpRequest : _window$XMLHttpReques,
      _window$encodeURI = window.encodeURI,
      encodeURI = _window$encodeURI === undefined ? window.encodeURI : _window$encodeURI;

  // As per issue #47, the web-components registry is inherited by a
  // new document created via createHTMLDocument. As per the spec
  // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
  // a new empty registry is used when creating a template contents owner
  // document, so we use that as our parent document to ensure nothing
  // is inherited.

  if (typeof HTMLTemplateElement === 'function') {
    var template = document.createElement('template');
    if (template.content && template.content.ownerDocument) {
      document = template.content.ownerDocument;
    }
  }

  var _document = document,
      implementation = _document.implementation,
      createNodeIterator = _document.createNodeIterator,
      getElementsByTagName = _document.getElementsByTagName,
      createDocumentFragment = _document.createDocumentFragment;

  var importNode = originalDocument.importNode;

  var hooks = {};

  /**
    * Expose whether this browser supports running the full DOMPurify.
    */
  DOMPurify.isSupported = implementation && typeof implementation.createHTMLDocument !== 'undefined' && document.documentMode !== 9;

  /**
    * We consider the elements and attributes below to be safe. Ideally
    * don't add any new ones but feel free to remove unwanted ones.
    */

  /* allowed element names */
  var ALLOWED_TAGS = null;
  var DEFAULT_ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray(html), _toConsumableArray(svg), _toConsumableArray(svgFilters), _toConsumableArray(mathMl), _toConsumableArray(text)));

  /* Allowed attribute names */
  var ALLOWED_ATTR = null;
  var DEFAULT_ALLOWED_ATTR = addToSet({}, [].concat(_toConsumableArray(html$1), _toConsumableArray(svg$1), _toConsumableArray(mathMl$1), _toConsumableArray(xml)));

  /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
  var FORBID_TAGS = null;

  /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
  var FORBID_ATTR = null;

  /* Decide if ARIA attributes are okay */
  var ALLOW_ARIA_ATTR = true;

  /* Decide if custom data attributes are okay */
  var ALLOW_DATA_ATTR = true;

  /* Decide if unknown protocols are okay */
  var ALLOW_UNKNOWN_PROTOCOLS = false;

  /* Output should be safe for jQuery's $() factory? */
  var SAFE_FOR_JQUERY = false;

  /* Output should be safe for common template engines.
   * This means, DOMPurify removes data attributes, mustaches and ERB
   */
  var SAFE_FOR_TEMPLATES = false;

  /* Specify template detection regex for SAFE_FOR_TEMPLATES mode */
  var MUSTACHE_EXPR = /\{\{[\s\S]*|[\s\S]*\}\}/gm;
  var ERB_EXPR = /<%[\s\S]*|[\s\S]*%>/gm;

  /* Decide if document with <html>... should be returned */
  var WHOLE_DOCUMENT = false;

  /* Track whether config is already set on this instance of DOMPurify. */
  var SET_CONFIG = false;

  /* Decide if all elements (e.g. style, script) must be children of
   * document.body. By default, browsers might move them to document.head */
  var FORCE_BODY = false;

  /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html string.
   * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
   */
  var RETURN_DOM = false;

  /* Decide if a DOM `DocumentFragment` should be returned, instead of a html string */
  var RETURN_DOM_FRAGMENT = false;

  /* If `RETURN_DOM` or `RETURN_DOM_FRAGMENT` is enabled, decide if the returned DOM
   * `Node` is imported into the current `Document`. If this flag is not enabled the
   * `Node` will belong (its ownerDocument) to a fresh `HTMLDocument`, created by
   * DOMPurify. */
  var RETURN_DOM_IMPORT = false;

  /* Output should be free from DOM clobbering attacks? */
  var SANITIZE_DOM = true;

  /* Keep element content when removing element? */
  var KEEP_CONTENT = true;

  /* Allow usage of profiles like html, svg and mathMl */
  var USE_PROFILES = {};

  /* Tags to ignore content of when KEEP_CONTENT is true */
  var FORBID_CONTENTS = addToSet({}, ['audio', 'head', 'math', 'script', 'style', 'template', 'svg', 'video']);

  /* Tags that are safe for data: URIs */
  var DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image']);

  /* Attributes safe for values like "javascript:" */
  var URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'summary', 'title', 'value', 'style', 'xmlns']);

  /* Keep a reference to config to pass to hooks */
  var CONFIG = null;

  /* Ideally, do not touch anything below this line */
  /* ______________________________________________ */

  var formElement = document.createElement('form');

  /**
  * _parseConfig
  *
  * @param  optional config literal
  */
  // eslint-disable-next-line complexity
  var _parseConfig = function _parseConfig(cfg) {
    /* Shield configuration object from tampering */
    if ((typeof cfg === 'undefined' ? 'undefined' : _typeof(cfg)) !== 'object') {
      cfg = {};
    }

    /* Set configuration parameters */
    ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS) : DEFAULT_ALLOWED_TAGS;
    ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR) : DEFAULT_ALLOWED_ATTR;
    FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS) : {};
    FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR) : {};
    USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
    SAFE_FOR_JQUERY = cfg.SAFE_FOR_JQUERY || false; // Default false
    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
    RETURN_DOM = cfg.RETURN_DOM || false; // Default false
    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
    RETURN_DOM_IMPORT = cfg.RETURN_DOM_IMPORT || false; // Default false
    FORCE_BODY = cfg.FORCE_BODY || false; // Default false
    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true

    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }

    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }

    /* Parse profile info */
    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray(text)));
      ALLOWED_ATTR = [];
      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html);
        addToSet(ALLOWED_ATTR, html$1);
      }
      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg);
        addToSet(ALLOWED_ATTR, svg$1);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg$1);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl);
        addToSet(ALLOWED_ATTR, mathMl$1);
        addToSet(ALLOWED_ATTR, xml);
      }
    }

    /* Merge configuration parameters */
    if (cfg.ADD_TAGS) {
      if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
        ALLOWED_TAGS = clone(ALLOWED_TAGS);
      }
      addToSet(ALLOWED_TAGS, cfg.ADD_TAGS);
    }
    if (cfg.ADD_ATTR) {
      if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
        ALLOWED_ATTR = clone(ALLOWED_ATTR);
      }
      addToSet(ALLOWED_ATTR, cfg.ADD_ATTR);
    }
    if (cfg.ADD_URI_SAFE_ATTR) {
      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR);
    }

    /* Add #text in case KEEP_CONTENT is set to true */
    if (KEEP_CONTENT) {
      ALLOWED_TAGS['#text'] = true;
    }

    // Prevent further manipulation of configuration.
    // Not available in IE8, Safari 5, etc.
    if (Object && 'freeze' in Object) {
      Object.freeze(cfg);
    }

    CONFIG = cfg;
  };

  /**
  * _forceRemove
  *
  * @param  a DOM node
  */
  var _forceRemove = function _forceRemove(node) {
    DOMPurify.removed.push({ element: node });
    try {
      node.parentNode.removeChild(node);
    } catch (err) {
      node.outerHTML = '';
    }
  };

  /**
  * _removeAttribute
  *
  * @param  an Attribute name
  * @param  a DOM node
  */
  var _removeAttribute = function _removeAttribute(name, node) {
    DOMPurify.removed.push({
      attribute: node.getAttributeNode(name),
      from: node
    });
    node.removeAttribute(name);
  };

  /**
  * _initDocument
  *
  * @param  a string of dirty markup
  * @return a DOM, filled with the dirty markup
  */
  var _initDocument = function _initDocument(dirty) {
    /* Create a HTML document */
    var doc = void 0;
    var body = void 0;

    if (FORCE_BODY) {
      dirty = '<remove></remove>' + dirty;
    }

    /* Use XHR if necessary because Safari 10.1 and newer are buggy */
    if (useXHR) {
      try {
        dirty = encodeURI(dirty);
      } catch (err) {}
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'document';
      xhr.open('GET', 'data:text/html;charset=utf-8,' + dirty, false);
      xhr.send(null);
      doc = xhr.response;
    }

    /* Use DOMParser to workaround Firefox bug (see comment below) */
    if (useDOMParser) {
      try {
        doc = new DOMParser().parseFromString(dirty, 'text/html');
      } catch (err) {}
    }

    /* Otherwise use createHTMLDocument, because DOMParser is unsafe in
    Safari (see comment below) */
    if (!doc || !doc.documentElement) {
      doc = implementation.createHTMLDocument('');
      body = doc.body;
      body.parentNode.removeChild(body.parentNode.firstElementChild);
      body.outerHTML = dirty;
    }

    /* Work on whole document or just its body */
    return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
  };

  // Safari 10.1+ (unfixed as of time of writing) has a catastrophic bug in
  // its implementation of DOMParser such that the following executes the
  // JavaScript:
  //
  // new DOMParser()
  //   .parseFromString('<svg onload=alert(document.domain)>', 'text/html');
  //
  // Later, it was also noticed that even more assumed benign and inert ways
  // of creating a document are now insecure thanks to Safari. So we work
  // around that with a feature test and use XHR to create the document in
  // case we really have to. That one seems safe for now.
  //
  // However, Firefox uses a different parser for innerHTML rather than
  // DOMParser (see https://bugzilla.mozilla.org/show_bug.cgi?id=1205631)
  // which means that you *must* use DOMParser, otherwise the output may
  // not be safe if used in a document.write context later.
  //
  // So we feature detect the Firefox bug and use the DOMParser if necessary.
  if (DOMPurify.isSupported) {
    (function () {
      var doc = _initDocument('<svg><g onload="this.parentNode.remove()"></g></svg>');
      if (!doc.querySelector('svg')) {
        useXHR = true;
      }
      try {
        doc = _initDocument('<svg><p><style><img src="</style><img src=x onerror=alert(1)//">');
        if (doc.querySelector('svg img')) {
          useDOMParser = true;
        }
      } catch (err) {}
    })();
  }

  /**
  * _createIterator
  *
  * @param  document/fragment to create iterator for
  * @return iterator instance
  */
  var _createIterator = function _createIterator(root) {
    return createNodeIterator.call(root.ownerDocument || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, function () {
      return NodeFilter.FILTER_ACCEPT;
    }, false);
  };

  /**
  * _isClobbered
  *
  * @param  element to check for clobbering attacks
  * @return true if clobbered, false if safe
  */
  var _isClobbered = function _isClobbered(elm) {
    if (elm instanceof Text || elm instanceof Comment) {
      return false;
    }
    if (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function') {
      return true;
    }
    return false;
  };

  /**
  * _isNode
  *
  * @param object to check whether it's a DOM node
  * @return true is object is a DOM node
  */
  var _isNode = function _isNode(obj) {
    return (typeof Node === 'undefined' ? 'undefined' : _typeof(Node)) === 'object' ? obj instanceof Node : obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && typeof obj.nodeType === 'number' && typeof obj.nodeName === 'string';
  };

  /**
  * _executeHook
  * Execute user configurable hooks
  *
  * @param  {String} entryPoint  Name of the hook's entry point
  * @param  {Node} currentNode
  */
  var _executeHook = function _executeHook(entryPoint, currentNode, data) {
    if (!hooks[entryPoint]) {
      return;
    }

    hooks[entryPoint].forEach(function (hook) {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  };

  /**
  * _sanitizeElements
  *
  * @protect nodeName
  * @protect textContent
  * @protect removeChild
  *
  * @param   node to check for permission to exist
  * @return  true if node was killed, false if left alive
  */
  var _sanitizeElements = function _sanitizeElements(currentNode) {
    var content = void 0;

    /* Execute a hook if present */
    _executeHook('beforeSanitizeElements', currentNode, null);

    /* Check if element is clobbered or can clobber */
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }

    /* Now let's check the element's type and name */
    var tagName = currentNode.nodeName.toLowerCase();

    /* Execute a hook if present */
    _executeHook('uponSanitizeElement', currentNode, {
      tagName: tagName,
      allowedTags: ALLOWED_TAGS
    });

    /* Remove element if anything forbids its presence */
    if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
      /* Keep content except for black-listed elements */
      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName] && typeof currentNode.insertAdjacentHTML === 'function') {
        try {
          currentNode.insertAdjacentHTML('AfterEnd', currentNode.innerHTML);
        } catch (err) {}
      }
      _forceRemove(currentNode);
      return true;
    }

    /* Convert markup to cover jQuery behavior */
    if (SAFE_FOR_JQUERY && !currentNode.firstElementChild && (!currentNode.content || !currentNode.content.firstElementChild) && /</g.test(currentNode.textContent)) {
      DOMPurify.removed.push({ element: currentNode.cloneNode() });
      currentNode.innerHTML = currentNode.textContent.replace(/</g, '&lt;');
    }

    /* Sanitize element content to be template-safe */
    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
      /* Get the element's text content */
      content = currentNode.textContent;
      content = content.replace(MUSTACHE_EXPR, ' ');
      content = content.replace(ERB_EXPR, ' ');
      if (currentNode.textContent !== content) {
        DOMPurify.removed.push({ element: currentNode.cloneNode() });
        currentNode.textContent = content;
      }
    }

    /* Execute a hook if present */
    _executeHook('afterSanitizeElements', currentNode, null);

    return false;
  };

  var DATA_ATTR = /^data-[\-\w.\u00B7-\uFFFF]/; // eslint-disable-line no-useless-escape
  var ARIA_ATTR = /^aria-[\-\w]+$/; // eslint-disable-line no-useless-escape
  var IS_ALLOWED_URI = /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i; // eslint-disable-line no-useless-escape
  var IS_SCRIPT_OR_DATA = /^(?:\w+script|data):/i;
  /* This needs to be extensive thanks to Webkit/Blink's behavior */
  var ATTR_WHITESPACE = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g;

  /**
  * _sanitizeAttributes
  *
  * @protect attributes
  * @protect nodeName
  * @protect removeAttribute
  * @protect setAttribute
  *
  * @param   node to sanitize
  * @return  void
  */
  // eslint-disable-next-line complexity
  var _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
    var attr = void 0;
    var name = void 0;
    var value = void 0;
    var lcName = void 0;
    var idAttr = void 0;
    var attributes = void 0;
    var l = void 0;
    /* Execute a hook if present */
    _executeHook('beforeSanitizeAttributes', currentNode, null);

    attributes = currentNode.attributes;

    /* Check if we have attributes; if not we might have a text node */
    if (!attributes) {
      return;
    }

    var hookEvent = {
      attrName: '',
      attrValue: '',
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR
    };
    l = attributes.length;

    /* Go backwards over all attributes; safely remove bad ones */
    while (l--) {
      attr = attributes[l];
      name = attr.name;
      value = attr.value.trim();
      lcName = name.toLowerCase();

      /* Execute a hook if present */
      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      _executeHook('uponSanitizeAttribute', currentNode, hookEvent);
      value = hookEvent.attrValue;

      /* Remove attribute */
      // Safari (iOS + Mac), last tested v8.0.5, crashes if you try to
      // remove a "name" attribute from an <img> tag that has an "id"
      // attribute at the time.
      if (lcName === 'name' && currentNode.nodeName === 'IMG' && attributes.id) {
        idAttr = attributes.id;
        attributes = Array.prototype.slice.apply(attributes);
        _removeAttribute('id', currentNode);
        _removeAttribute(name, currentNode);
        if (attributes.indexOf(idAttr) > l) {
          currentNode.setAttribute('id', idAttr.value);
        }
      } else if (
      // This works around a bug in Safari, where input[type=file]
      // cannot be dynamically set after type has been removed
      currentNode.nodeName === 'INPUT' && lcName === 'type' && value === 'file' && (ALLOWED_ATTR[lcName] || !FORBID_ATTR[lcName])) {
        continue;
      } else {
        // This avoids a crash in Safari v9.0 with double-ids.
        // The trick is to first set the id to be empty and then to
        // remove the attribute
        if (name === 'id') {
          currentNode.setAttribute(name, '');
        }
        _removeAttribute(name, currentNode);
      }

      /* Did the hooks approve of the attribute? */
      if (!hookEvent.keepAttr) {
        continue;
      }

      /* Make sure attribute cannot clobber */
      if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in window || value in document || value in formElement)) {
        continue;
      }

      /* Sanitize attribute content to be template-safe */
      if (SAFE_FOR_TEMPLATES) {
        value = value.replace(MUSTACHE_EXPR, ' ');
        value = value.replace(ERB_EXPR, ' ');
      }

      /* Allow valid data-* attributes: At least one character after "-"
         (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
         XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
         We don't need to check the value; it's always URI safe. */
      if (ALLOW_DATA_ATTR && DATA_ATTR.test(lcName)) {
        // This attribute is safe
      } else if (ALLOW_ARIA_ATTR && ARIA_ATTR.test(lcName)) {
        // This attribute is safe
        /* Otherwise, check the name is permitted */
      } else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
        continue;

        /* Check value is safe. First, is attr inert? If so, is safe */
      } else if (URI_SAFE_ATTRIBUTES[lcName]) {
        // This attribute is safe
        /* Check no script, data or unknown possibly unsafe URI
         unless we know URI values are safe for that attribute */
      } else if (IS_ALLOWED_URI.test(value.replace(ATTR_WHITESPACE, ''))) {
        // This attribute is safe
        /* Keep image data URIs alive if src/xlink:href is allowed */
      } else if ((lcName === 'src' || lcName === 'xlink:href') && value.indexOf('data:') === 0 && DATA_URI_TAGS[currentNode.nodeName.toLowerCase()]) {
        // This attribute is safe
        /* Allow unknown protocols: This provides support for links that
         are handled by protocol handlers which may be unknown ahead of
         time, e.g. fb:, spotify: */
      } else if (ALLOW_UNKNOWN_PROTOCOLS && !IS_SCRIPT_OR_DATA.test(value.replace(ATTR_WHITESPACE, ''))) {
        // This attribute is safe
        /* Check for binary attributes */
        // eslint-disable-next-line no-negated-condition
      } else if (!value) {
        // Binary attributes are safe at this point
        /* Anything else, presume unsafe, do not add it back */
      } else {
        continue;
      }

      /* Handle invalid data-* attribute set by try-catching it */
      try {
        currentNode.setAttribute(name, value);
        DOMPurify.removed.pop();
      } catch (err) {}
    }

    /* Execute a hook if present */
    _executeHook('afterSanitizeAttributes', currentNode, null);
  };

  /**
  * _sanitizeShadowDOM
  *
  * @param  fragment to iterate over recursively
  * @return void
  */
  var _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
    var shadowNode = void 0;
    var shadowIterator = _createIterator(fragment);

    /* Execute a hook if present */
    _executeHook('beforeSanitizeShadowDOM', fragment, null);

    while (shadowNode = shadowIterator.nextNode()) {
      /* Execute a hook if present */
      _executeHook('uponSanitizeShadowNode', shadowNode, null);

      /* Sanitize tags and elements */
      if (_sanitizeElements(shadowNode)) {
        continue;
      }

      /* Deep shadow DOM detected */
      if (shadowNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(shadowNode.content);
      }

      /* Check attributes, sanitize if necessary */
      _sanitizeAttributes(shadowNode);
    }

    /* Execute a hook if present */
    _executeHook('afterSanitizeShadowDOM', fragment, null);
  };

  /**
  * Sanitize
  * Public method providing core sanitation functionality
  *
  * @param {String|Node} dirty string or DOM node
  * @param {Object} configuration object
  */
  // eslint-disable-next-line complexity
  DOMPurify.sanitize = function (dirty, cfg) {
    var body = void 0;
    var importedNode = void 0;
    var currentNode = void 0;
    var oldNode = void 0;
    var returnNode = void 0;
    /* Make sure we have a string to sanitize.
      DO NOT return early, as this will return the wrong type if
      the user has requested a DOM object rather than a string */
    if (!dirty) {
      dirty = '<!-->';
    }

    /* Stringify, in case dirty is an object */
    if (typeof dirty !== 'string' && !_isNode(dirty)) {
      // eslint-disable-next-line no-negated-condition
      if (typeof dirty.toString !== 'function') {
        throw new TypeError('toString is not a function');
      } else {
        dirty = dirty.toString();
      }
    }

    /* Check we can run. Otherwise fall back or ignore */
    if (!DOMPurify.isSupported) {
      if (_typeof(window.toStaticHTML) === 'object' || typeof window.toStaticHTML === 'function') {
        if (typeof dirty === 'string') {
          return window.toStaticHTML(dirty);
        } else if (_isNode(dirty)) {
          return window.toStaticHTML(dirty.outerHTML);
        }
      }
      return dirty;
    }

    /* Assign config vars */
    if (!SET_CONFIG) {
      _parseConfig(cfg);
    }

    /* Clean up removed elements */
    DOMPurify.removed = [];

    if (dirty instanceof Node) {
      /* If dirty is a DOM element, append to an empty document to avoid
         elements being stripped by the parser */
      body = _initDocument('<!-->');
      importedNode = body.ownerDocument.importNode(dirty, true);
      if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
        /* Node is already a body, use as is */
        body = importedNode;
      } else {
        body.appendChild(importedNode);
      }
    } else {
      /* Exit directly if we have nothing to do */
      if (!RETURN_DOM && !WHOLE_DOCUMENT && dirty.indexOf('<') === -1) {
        return dirty;
      }

      /* Initialize the document to work on */
      body = _initDocument(dirty);

      /* Check we have a DOM node from the data */
      if (!body) {
        return RETURN_DOM ? null : '';
      }
    }

    /* Remove first element node (ours) if FORCE_BODY is set */
    if (FORCE_BODY) {
      _forceRemove(body.firstChild);
    }

    /* Get node iterator */
    var nodeIterator = _createIterator(body);

    /* Now start iterating over the created document */
    while (currentNode = nodeIterator.nextNode()) {
      /* Fix IE's strange behavior with manipulated textNodes #89 */
      if (currentNode.nodeType === 3 && currentNode === oldNode) {
        continue;
      }

      /* Sanitize tags and elements */
      if (_sanitizeElements(currentNode)) {
        continue;
      }

      /* Shadow DOM detected, sanitize it */
      if (currentNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(currentNode.content);
      }

      /* Check attributes, sanitize if necessary */
      _sanitizeAttributes(currentNode);

      oldNode = currentNode;
    }

    /* Return sanitized string or DOM */
    if (RETURN_DOM) {
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);

        while (body.firstChild) {
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }

      if (RETURN_DOM_IMPORT) {
        /* AdoptNode() is not used because internal state is not reset
               (e.g. the past names map of a HTMLFormElement), this is safe
               in theory but we would rather not risk another attack vector.
               The state that is cloned by importNode() is explicitly defined
               by the specs. */
        returnNode = importNode.call(originalDocument, returnNode, true);
      }

      return returnNode;
    }

    return WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
  };

  /**
  * Public method to set the configuration once
  * setConfig
  *
  * @param {Object} configuration object
  * @return void
  */
  DOMPurify.setConfig = function (cfg) {
    _parseConfig(cfg);
    SET_CONFIG = true;
  };

  /**
  * Public method to remove the configuration
  * clearConfig
  *
  * @return void
  */
  DOMPurify.clearConfig = function () {
    CONFIG = null;
    SET_CONFIG = false;
  };

  /**
  * AddHook
  * Public method to add DOMPurify hooks
  *
  * @param {String} entryPoint
  * @param {Function} hookFunction
  */
  DOMPurify.addHook = function (entryPoint, hookFunction) {
    if (typeof hookFunction !== 'function') {
      return;
    }
    hooks[entryPoint] = hooks[entryPoint] || [];
    hooks[entryPoint].push(hookFunction);
  };

  /**
  * RemoveHook
  * Public method to remove a DOMPurify hook at a given entryPoint
  * (pops it from the stack of hooks if more are present)
  *
  * @param {String} entryPoint
  * @return void
  */
  DOMPurify.removeHook = function (entryPoint) {
    if (hooks[entryPoint]) {
      hooks[entryPoint].pop();
    }
  };

  /**
  * RemoveHooks
  * Public method to remove all DOMPurify hooks at a given entryPoint
  *
  * @param  {String} entryPoint
  * @return void
  */
  DOMPurify.removeHooks = function (entryPoint) {
    if (hooks[entryPoint]) {
      hooks[entryPoint] = [];
    }
  };

  /**
  * RemoveAllHooks
  * Public method to remove all DOMPurify hooks
  *
  * @return void
  */
  DOMPurify.removeAllHooks = function () {
    hooks = {};
  };

  return DOMPurify;
}

var purify = createDOMPurify();

return purify;

})));

});

// jshint strict: false

// Taken from medium editor: https://github.com/yabwe/medium-editor/blob/master/src/js/extensions/paste.js
/**
* @access protected
*/
var pasteUtils = {
    createReplacements: function createReplacements() {
        return [
        // Remove anything but the contents within the BODY element
        [new RegExp(/^[\s\S]*<body[^>]*>\s*|\s*<\/body[^>]*>[\s\S]*$/g), ''],

        // cleanup comments added by Chrome when pasting html
        [new RegExp(/<!--StartFragment-->|<!--EndFragment-->/g), ''],

        // Trailing BR elements
        [new RegExp(/<br>$/i), ''],

        // replace two bogus tags that begin pastes from google docs
        [new RegExp(/<[^>]*docs-internal-guid[^>]*>/gi), ''], [new RegExp(/<\/b>(<br[^>]*>)?$/gi), ''],

        // un-html spaces and newlines inserted by OS X
        [new RegExp(/<span class="Apple-converted-space">\s+<\/span>/g), ' '], [new RegExp(/<br class="Apple-interchange-newline">/g), '<br>'],

        // replace google docs italics+bold with a span to be replaced once the html is inserted
        [new RegExp(/<span[^>]*(font-style:italic;font-weight:(bold|700)|font-weight:(bold|700);font-style:italic)[^>]*>/gi), '<span class="replace-with italic bold">'],

        // replace google docs italics with a span to be replaced once the html is inserted
        [new RegExp(/<span[^>]*font-style:italic[^>]*>/gi), '<span class="replace-with italic">'],

        //[replace google docs bolds with a span to be replaced once the html is inserted
        [new RegExp(/<span[^>]*font-weight:(bold|700)[^>]*>/gi), '<span class="replace-with bold">'],

        // replace manually entered b/i/a tags with real ones
        [new RegExp(/&lt;(\/?)(i|b|a)&gt;/gi), '<$1$2>'],

        // replace manually a tags with real ones, converting smart-quotes from google docs
        [new RegExp(/&lt;a(?:(?!href).)+href=(?:&quot;|&rdquo;|&ldquo;|"|“|”)(((?!&quot;|&rdquo;|&ldquo;|"|“|”).)*)(?:&quot;|&rdquo;|&ldquo;|"|“|”)(?:(?!&gt;).)*&gt;/gi), '<a href="$1">'],

        // Newlines between paragraphs in html have no syntactic value,
        // but then have a tendency to accidentally become additional paragraphs down the line
        [new RegExp(/<\/p>\n+/gi), '</p>'], [new RegExp(/\n+<p/gi), '<p'],

        // Microsoft Word makes these odd tags, like <o:p></o:p>
        [new RegExp(/<\/?o:[a-z]*>/gi), ''],

        // Microsoft Word adds some special elements around list items
        [new RegExp(/<!\[if !supportLists\]>(((?!<!).)*)<!\[endif]\>/gi), '$1']];
    }
};

// jshint strict: false

/**
* @access protected
*/
var Paste = Module({
    name: 'Paste',
    props: {},
    handlers: {
        commands: {},
        requests: {},
        events: {
            'contenteditable:paste': 'handlePaste'
        }
    },
    methods: {
        init: function init() {},
        handlePaste: function handlePaste(evnt) {
            evnt.preventDefault();

            var mediator = this.mediator;

            var _getClipboardContent = this.getClipboardContent(evnt, window, document),
                pastedHTML = _getClipboardContent['text/html'],
                pastedPlain = _getClipboardContent['text/plain'];

            if (!pastedHTML) {
                pastedHTML = pastedPlain.replace(/(?:\r\n|\r|\n)/g, '<br />');
            }

            pastedHTML = this.cleanPastedHTML(pastedHTML);
            pastedHTML = purify.sanitize(pastedHTML);

            mediator.exec('contenteditable:inserthtml', pastedHTML);
        },
        getClipboardContent: function getClipboardContent(evnt, contextWindow, contextDocument) {
            var dataTransfer = evnt.clipboardData || contextWindow.clipboardData || contextDocument.dataTransfer;
            var data = {
                pastedHTML: '',
                pastedPlain: ''
            };

            if (!dataTransfer) {
                return data;
            }

            if (dataTransfer.getData) {
                var legacyText = dataTransfer.getData('text');
                if (legacyText && legacyText.length > 0) {
                    data['text/plain'] = legacyText;
                }
            }

            if (dataTransfer.types) {
                for (var i = 0; i < dataTransfer.types.length; i++) {
                    var contentType = dataTransfer.types[i];
                    data[contentType] = dataTransfer.getData(contentType);
                }
            }

            return data;
        },
        cleanPastedHTML: function cleanPastedHTML(pastedHTML) {
            var mediator = this.mediator;

            var canvasDoc = mediator.get('canvas:document');
            var canvasBody = mediator.get('canvas:body');
            var replacements = pasteUtils.createReplacements();

            for (var i = 0; i < replacements.length; i++) {
                var replacement = replacements[i];
                pastedHTML = pastedHTML.replace(replacement[0], replacement[1]);
            }

            canvasBody.innerHTML = '<p>' + pastedHTML.split('<br><br>').join('</p><p>') + '</p>';

            var elList = canvasBody.querySelectorAll('a,p,div,br');
            for (var _i = 0; _i < elList.length; _i++) {
                var workEl = elList[_i];

                workEl.innerHTML = workEl.innerHTML.replace(/\n/gi, ' ');
            }

            var pasteBlock = canvasDoc.createDocumentFragment();
            var pasteBlockBody = canvasDoc.createElement('body');
            pasteBlock.appendChild(pasteBlockBody);
            pasteBlockBody.innerHTML = canvasBody.innerHTML;

            this.cleanupSpans(pasteBlockBody);
            this.cleanupDivs(pasteBlockBody);

            elList = pasteBlockBody.querySelectorAll('*');
            for (var _i2 = 0; _i2 < elList.length; _i2++) {
                var _workEl = elList[_i2];
                var elAttrs = [];

                for (var j = 0; j < _workEl.attributes.length; j++) {
                    elAttrs.push(_workEl.attributes[j].name);
                }

                for (var k = 0; k < elAttrs.length; k++) {
                    var attrName = elAttrs[k];
                    if (!(_workEl.nodeName === 'A' && attrName === 'href')) {
                        _workEl.removeAttribute(attrName);
                    }
                }
            }

            canvasBody.innerHTML = pasteBlockBody.innerHTML;
            mediator.exec('format:list:cleanup', canvasBody);
            mediator.exec('format:clean', canvasBody);

            pastedHTML = canvasBody.innerHTML;
            return pastedHTML;
        },
        cleanupSpans: function cleanupSpans(containerEl) {
            var spans = containerEl.querySelectorAll('.replace-with');

            for (var i = 0; i < spans.length; i++) {
                var span = spans[i];
                var replaceBold = span.classList.contains('bold');
                var replaceItalic = span.classList.contains('italic');
                var replacement = document.createElement(replaceBold ? 'b' : 'i');

                if (replaceBold && replaceItalic) {
                    replacement.innerHTML = '<i>' + span.innerHTML + '</i>';
                } else {
                    replacement.innerHTML = span.innerHTML;
                }

                span.parentNode.replaceChild(replacement, span);
            }

            spans = containerEl.querySelectorAll('span');
            for (var _i3 = 0; _i3 < spans.length; _i3++) {
                var _span = spans[_i3];
                DOM.unwrap(_span);
            }
        },
        cleanupDivs: function cleanupDivs(containerEl) {
            var divs = containerEl.querySelectorAll('div');
            for (var i = divs.length - 1; i >= 0; i--) {
                DOM.unwrap(divs[i]);
            }
        }
    }
});

// jshint strict: false

/**
 * FormatterContainer - Initializes and bootstraps all the formatter modules.
 * It requires only a mediator instance to delegate events to.
 *
 * @access protected
 * @module containers/FormatterContainer
 *
 * @requires core/Container
 * @requires modules/BaseFormatter
 * @requires modules/BlockFormatter
 * @requires modules/TextFormatter
 * @requires modules/ListFormatter
 * @requires modules/LinkFormatter
 * @requires modules/Paste
 *
 * @example
 * new FormatterContainer({ mediator: mediatorInstance });
 */
/**
 * @constructor FormatterContainer
 * @param {object} opts={} - container options
 * @param {mediator} opts.mediator - The mediator to delegate events up to
 * @return {container} CanvasContainer instance
 */
var FormatterContainer = Container({
    name: 'FormatterContainer',

    /**
     * Child Modules: [{@link modules/BaseFormatter}, {@link modules/BlockFormatter},
     * {@link modules/TextFormatter}, {@link modules/TextFormatter}, {@link modules/LinkFormatter},
     * {@link modules/Paste}]
     * @enum {Array<{class:Module}>} modules
     */
    modules: [{
        class: BaseFormatter
    }, {
        class: BlockFormatter
    }, {
        class: TextFormatter
    }, {
        class: ListFormatter
    }, {
        class: LinkFormatter
    }, {
        class: Paste
    }]
});

// jshint strict: false
/**
 * Selection
 *
 * A module to handle everything that happens with the user's selection and the
 * selection range
 *
 * @access protected
 * @module modules/Selection
 */

/**
 * Creates a new Selection handler
 * @constructor Selection
 */
var Selection = Module({
    name: 'Selection',
    props: {
        contextWindow: window,
        contextDocument: document,
        cachedSelection: null,
        cachedRange: null,
        pseudoSelection: null,
        silenceChanges: []
    },
    dom: {
        el: null
    },
    handlers: {
        requests: {
            'selection:current': 'getCurrentSelection',
            'selection:range': 'getCurrentRange',
            'selection:anchornode': 'getAnchorNode',
            'selection:commonancestor': 'getCommonAncestor',
            'selection:closestblock': 'getClosestBlock',
            'selection:rootelement': 'getRootElement',
            'selection:range:clone': 'getRangeClone',
            'selection:bounds': 'getSelectionBounds',
            'selection:range:relative:toroot': 'getRangeRelativeToRoot',
            'selection:in:or:contains': 'inOrContains',
            'selection:range:coordinates': 'rangeCoordinates',
            'selection:contains:node': 'containsNode',
            'selection:spans:multiple:blocks': 'spansMultipleBlocks'
        },

        commands: {
            'selection:set:contextWindow': 'setContextWindow',
            'selection:set:contextDocument': 'setContextDocument',
            'selection:set:el': 'setRootElement',
            'selection:expand:toroot': 'expandToRoot',
            'selection:update:range': 'updateRange',
            'selection:wrap:element': 'wrapElement',
            'selection:wrap:content': 'wrapContent',
            'selection:wrap:pseudo': 'wrapPseudoSelect',
            'selection:select:pseudo': 'selectPseudo',
            'selection:select:remove:pseudo': 'removePseudo',
            'selection:collapse:tostart': 'collapseToStart',
            'selection:reselect': 'reSelect',
            'selection:select:contents': 'selectContents',
            'selection:collapse:toend': 'collapseToEnd',
            'selection:select:all': 'selectAll',
            'selection:select:coordinates': 'selectByCoordinates',
            'selection:ensure:text:only': 'ensureTextOnlySelection',
            'selection:deselect': 'deSelect'
        }
    },
    methods: {
        init: function init() {
            this.bindDocumentEvents();
        },
        bindDocumentEvents: function bindDocumentEvents() {
            var contextDocument = this.props.contextDocument;

            contextDocument.addEventListener('selectstart', this.handleSelectStart);
            contextDocument.addEventListener('selectionchange', this.handleSelectionChange);
        },
        unbindDocumentEvents: function unbindDocumentEvents() {
            var contextDocument = this.props.contextDocument;

            contextDocument.removeEventListener('selectstart', this.handleSelectStart);
            contextDocument.removeEventListener('selectionchange', this.handleSelectionChange);
        },
        setContextWindow: function setContextWindow(contextWindow) {
            var props = this.props;

            props.contextWindow = contextWindow;
        },
        setContextDocument: function setContextDocument(contextDocument) {
            var props = this.props;

            this.unbindDocumentEvents();
            props.contextDocument = contextDocument;
            this.bindDocumentEvents();
        },
        setRootElement: function setRootElement(elem) {
            var dom = this.dom;

            dom.el = [elem];
        },
        handleSelectStart: function handleSelectStart(evnt) {
            var mediator = this.mediator;
            var el = this.dom.el;

            var anchorNode = this.getAnchorNode();

            if (DOM.isChildOf(anchorNode, el)) {
                mediator.emit('selection:start', evnt);
            }
        },
        handleSelectionChange: function handleSelectionChange(evnt) {
            var mediator = this.mediator,
                props = this.props;
            var el = this.dom.el;

            var anchorNode = this.getAnchorNode();

            if (DOM.isChildOf(anchorNode, el)) {
                this.cacheRange();
                if (!props.silenceChanges.length) {
                    mediator.emit('selection:change', evnt);
                } else {
                    props.silenceChanges.pop();
                }
            }
        },
        cacheRange: function cacheRange() {
            var currentRange = this.getCurrentRange();
            this.props.cachedRange = currentRange.cloneRange();
        },
        getCurrentSelection: function getCurrentSelection() {
            var contextWindow = this.props.contextWindow;

            return contextWindow.getSelection();
        },
        validateSelection: function validateSelection(selection) {
            var dom = this.dom;

            return selection.anchorNode && DOM.isChildOf(selection.anchorNode, dom.el);
        },
        getCurrentRange: function getCurrentRange() {
            var props = this.props;

            var currentSelection = this.getCurrentSelection();
            var currentRange = void 0;

            if (this.validateSelection(currentSelection)) {
                currentRange = currentSelection.getRangeAt(0);
            } else if (props.cachedRange) {
                currentRange = props.cachedRange;
            } else {
                currentRange = document.createRange();
            }

            return currentRange;
        },
        getAnchorNode: function getAnchorNode() {
            var currentSelection = this.getCurrentSelection();
            return currentSelection.anchorNode;
        },
        getCommonAncestor: function getCommonAncestor() {
            var currentSelection = this.getCurrentSelection();
            if (currentSelection.rangeCount > 0) {
                var selectionRange = currentSelection.getRangeAt(0);
                return selectionRange.commonAncestorContainer;
            }
        },
        getClosestBlock: function getClosestBlock() {
            var commonAncestor = this.getCommonAncestor();
            var closestBlockEl = null;
            var currentNode = commonAncestor;

            while (!closestBlockEl && !this.isContentEditable(currentNode) && currentNode) {
                if (currentNode.nodeType === Node.ELEMENT_NODE) {
                    var nodeTagName = currentNode.tagName.toLowerCase();
                    if (config.blockElementNames.indexOf(nodeTagName) > -1) {
                        closestBlockEl = currentNode;
                    } else {
                        currentNode = currentNode.parentNode;
                    }
                } else {
                    currentNode = currentNode.parentNode;
                }
            }

            return closestBlockEl;
        },
        getRootElement: function getRootElement() {
            var dom = this.dom;

            return dom.el[0];
        },
        getRangeClone: function getRangeClone() {
            var currentRange = this.getCurrentRange();
            return currentRange.cloneRange();
        },
        getRangeRelativeToRoot: function getRangeRelativeToRoot() {
            var _getCurrentRange = this.getCurrentRange(),
                startContainer = _getCurrentRange.startContainer,
                startOffset = _getCurrentRange.startOffset,
                endContainer = _getCurrentRange.endContainer,
                endOffset = _getCurrentRange.endOffset;

            var startCoordinates = [];
            var endCoordinates = [];
            var startRootChildIndex = 0;

            startCoordinates.unshift(startOffset);
            endCoordinates.unshift(endOffset);

            while (!this.isContentEditable(startContainer)) {
                if (this.isContentEditable(startContainer.parentNode)) {
                    startRootChildIndex = DOM.childIndex(startContainer);
                    startCoordinates.unshift(0);
                } else {
                    startCoordinates.unshift(DOM.childIndex(startContainer));
                }
                startContainer = startContainer.parentNode;
            }

            while (!this.isContentEditable(endContainer)) {
                if (this.isContentEditable(endContainer.parentNode)) {
                    endCoordinates.unshift(DOM.childIndex(endContainer) - startRootChildIndex);
                } else {
                    endCoordinates.unshift(DOM.childIndex(endContainer));
                }
                endContainer = endContainer.parentNode;
            }

            return {
                startCoordinates: startCoordinates,
                endCoordinates: endCoordinates
            };
        },
        rangeCoordinates: function rangeCoordinates() {
            this.ensureTextOnlySelection();

            var _getCurrentRange2 = this.getCurrentRange(),
                startContainer = _getCurrentRange2.startContainer,
                startOffset = _getCurrentRange2.startOffset,
                endContainer = _getCurrentRange2.endContainer,
                endOffset = _getCurrentRange2.endOffset;

            var startCoordinates = [];
            var endCoordinates = [];

            startCoordinates.unshift(startOffset);
            endCoordinates.unshift(endOffset);

            while (!this.isContentEditable(startContainer)) {
                startCoordinates.unshift(DOM.childIndex(startContainer));
                startContainer = startContainer.parentNode;
            }

            while (!this.isContentEditable(endContainer)) {
                endCoordinates.unshift(DOM.childIndex(endContainer));
                endContainer = endContainer.parentNode;
            }

            return {
                startCoordinates: startCoordinates,
                endCoordinates: endCoordinates
            };
        },
        inOrContains: function inOrContains(selectors) {
            var dom = this.dom;

            var rootEl = dom.el[0];
            var anchorNode = this.getAnchorNode();

            if (!rootEl.contains(anchorNode)) {
                return false;
            }

            var isIn = DOM.isIn(anchorNode, selectors, rootEl);

            if (isIn) {
                return isIn;
            }

            var currentRange = this.getCurrentRange();
            var rangeFrag = currentRange.cloneContents();
            var contains = false;

            if (rangeFrag.childNodes.length) {
                selectors.forEach(function (selector) {
                    contains = contains || rangeFrag.childNodes[0].nodeName === selector;
                });
            }

            return contains;
        },
        containsNode: function containsNode(node) {
            var currentSelection = this.getCurrentSelection();
            var anchorNode = currentSelection.anchorNode,
                focusNode = currentSelection.focusNode;

            var selectionContainsNode = currentSelection.containsNode(node, true);

            if (!currentSelection.rangeCount) {
                return false;
            }

            if (selectionContainsNode) {
                return true;
            }

            if (anchorNode.nodeType !== Node.ELEMENT_NODE) {
                anchorNode = anchorNode.parentNode;
            }
            if (focusNode.nodeType !== Node.ELEMENT_NODE) {
                focusNode = focusNode.parentNode;
            }

            return anchorNode === node || focusNode === node;
        },
        expandToRoot: function expandToRoot() {
            var _this = this;

            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var currentRange = opts.range || this.getCurrentRange();
            var startRootNode = currentRange.startContainer;
            var endRootNode = currentRange.endContainer;
            var newRange = document.createRange();
            var startEqualsEnd = startRootNode === endRootNode;

            if (this.isContentEditable(startRootNode)) {
                return;
            }

            var getRootEl = function getRootEl(node) {
                var currentNode = node;
                if (!_this.isContentEditable(currentNode)) {
                    while (currentNode.parentNode && !_this.isContentEditable(currentNode.parentNode)) {
                        currentNode = currentNode.parentNode;
                    }
                }
                return currentNode;
            };

            startRootNode = getRootEl(startRootNode);
            endRootNode = startEqualsEnd ? startRootNode : getRootEl(endRootNode);

            if (opts.innerBounds) {
                newRange.setStartAfter(startRootNode);
                newRange.setEndBefore(endRootNode);
            } else {
                newRange.setStart(startRootNode, 0);
                newRange.setEndAfter(endRootNode);
            }

            this.updateRange(newRange, { silent: true });
        },
        wrapElement: function wrapElement(elem) {
            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var currentRange = this.getCurrentRange();

            if (elem instanceof Array) {
                currentRange.setStartBefore(elem[0]);
                currentRange.setEndAfter(elem[elem.length - 1]);
            } else if (elem.nodeType === Node.ELEMENT_NODE) {
                currentRange.setStartBefore(elem);
                currentRange.setEndAfter(elem);
            }

            this.updateRange(currentRange, opts);
        },
        wrapContent: function wrapContent() {
            var currentRange = this.getCurrentRange();
            var selectionRootEl = this.getRootElement();
            currentRange.selectNodeContents(selectionRootEl);
            this.updateRange(currentRange);
        },
        wrapPseudoSelect: function wrapPseudoSelect() {
            var props = this.props;

            var currentRange = this.getCurrentRange();

            var pseudoSelection = document.createElement('span');
            pseudoSelection.classList.add('typester-pseudo-selection');
            pseudoSelection.appendChild(currentRange.extractContents());
            currentRange.insertNode(pseudoSelection);

            props.pseudoSelection = pseudoSelection;
            this.wrapElement(pseudoSelection);
        },
        selectPseudo: function selectPseudo() {
            var dom = this.dom;

            var unwrappedNodes = this.removePseudo();

            if (unwrappedNodes.length) {
                dom.el[0].focus();
                this.wrapElement(unwrappedNodes, { silent: true });
            }
        },
        removePseudo: function removePseudo() {
            var props = this.props;

            var unwrappedNodes = [];

            if (props.pseudoSelection && props.pseudoSelection.tagName) {
                unwrappedNodes = DOM.unwrap(props.pseudoSelection);
                props.pseudoSelection = null;
            }

            return unwrappedNodes;
        },
        selectContents: function selectContents(node) {
            var newRange = document.createRange();

            if (node.childNodes.length) {
                newRange.selectNodeContents(node);
            } else {
                newRange.setStart(node, 0);
                newRange.collapse(true);
            }

            this.updateRange(newRange);
        },
        updateRange: function updateRange(range) {
            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var mediator = this.mediator,
                props = this.props;

            var currentSelection = this.getCurrentSelection();

            if (opts.silent) {
                props.silenceChanges.push(true); // silence removeAllRanges
                props.silenceChanges.push(true); // silence addRange
            }

            currentSelection.removeAllRanges();
            currentSelection.addRange(range);

            if (!opts.silent) {
                mediator.emit('selection:update');
            }
        },
        deSelect: function deSelect() {
            var currentSelection = this.getCurrentSelection();
            currentSelection.removeAllRanges();
        },
        isContentEditable: function isContentEditable(node) {
            return node && node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('contenteditable');
        },
        getSelectionBounds: function getSelectionBounds() {
            var currentRange = this.getCurrentRange();
            var rangeRects = currentRange ? currentRange.getClientRects() : [];
            var rangeBoundingClientRect = currentRange ? currentRange.getBoundingClientRect() : null;

            var selectionBounds = {
                top: null,
                right: null,
                bottom: null,
                left: null,
                height: null,
                width: null,
                initialWidth: null,
                initialLeft: null
            };

            var setSelectionBoundary = function setSelectionBoundary(rangeRect) {
                ['top', 'left', 'bottom', 'right', 'height', 'width'].forEach(function (rectKey) {
                    if (!selectionBounds[rectKey]) {
                        selectionBounds[rectKey] = rangeRect[rectKey];
                    } else {
                        switch (rectKey) {
                            case 'top':
                            case 'left':
                                selectionBounds[rectKey] = Math.min(selectionBounds[rectKey], rangeRect[rectKey]);
                                break;
                            case 'bottom':
                            case 'right':
                            case 'height':
                            case 'width':
                                selectionBounds[rectKey] = Math.max(selectionBounds[rectKey], rangeRect[rectKey]);
                                break;
                        }
                    }
                });
            };

            var setInitialBoundary = function setInitialBoundary(rangeRect) {
                if (rangeBoundingClientRect) {
                    selectionBounds.initialLeft = rangeBoundingClientRect.left;
                    selectionBounds.initialWidth = rangeBoundingClientRect.width;
                } else if (rangeRect.top === selectionBounds.top) {
                    if (selectionBounds.initialLeft === null) {
                        selectionBounds.initialLeft = rangeRect.left;
                    } else {
                        selectionBounds.initialLeft = Math.min(rangeRect.left, selectionBounds.initialLeft);
                    }

                    if (selectionBounds.initialWidth === null) {
                        selectionBounds.initialWidth = rangeRect.width;
                    } else {
                        selectionBounds.initialWidth = Math.max(rangeRect.right - selectionBounds.initialLeft, selectionBounds.initialWidth);
                    }
                }
            };

            for (var i = 0; i < rangeRects.length; i++) {
                setSelectionBoundary(rangeRects[i], i);
            }

            for (var _i = 0; _i < rangeRects.length; _i++) {
                setInitialBoundary(rangeRects[_i], _i);
            }

            return selectionBounds;
        },
        collapseToStart: function collapseToStart() {
            var currentRange = this.getCurrentRange();
            var newRange = document.createRange();

            newRange.setStart(currentRange.startContainer, currentRange.startOffset);
            newRange.setEnd(currentRange.startContainer, currentRange.startOffset);

            this.updateRange(newRange);
        },
        collapseToEnd: function collapseToEnd() {
            var currentSelection = this.getCurrentSelection();
            currentSelection.collapseToEnd();
        },
        reSelect: function reSelect() {
            var props = this.props;

            if (props.cachedRange) {
                this.updateRange(props.cachedRange, { silent: true });
            }
        },
        selectAll: function selectAll() {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var dom = this.dom,
                props = this.props;
            var contextDocument = props.contextDocument;

            var range = contextDocument.createRange();
            var rootElem = dom.el[0];

            if (opts.selector) {
                var elems = contextDocument.querySelectorAll(opts.selector);
                range.setStartBefore(elems[0]);
                range.setEndAfter(elems[elems.lenght - 1]);
            } else {
                range.setStart(rootElem, 0);
                range.setEndAfter(rootElem.lastChild);
            }

            this.updateRange(range);
        },
        selectByCoordinates: function selectByCoordinates(rangeCoordinates) {
            var dom = this.dom,
                props = this.props;
            var contextDocument = props.contextDocument;

            var newRange = contextDocument.createRange();
            var startCoordinates = rangeCoordinates.startCoordinates.slice(0);
            var endCoordinates = rangeCoordinates.endCoordinates.slice(0);
            var startOffset = startCoordinates.pop();
            var endOffset = endCoordinates.pop();

            var startContainer = dom.el[0];
            var endContainer = dom.el[0];

            while (startCoordinates.length) {
                var startIndex = startCoordinates.shift();
                startContainer = startContainer.childNodes[startIndex];
            }

            while (endCoordinates.length) {
                var endIndex = endCoordinates.shift();
                endContainer = endContainer.childNodes[endIndex];
            }

            newRange.setStart(startContainer, startOffset);
            newRange.setEnd(endContainer, endOffset);

            this.updateRange(newRange);
        },
        ensureTextOnlySelection: function ensureTextOnlySelection() {
            var contextDocument = this.props.contextDocument;

            var currentRange = this.getCurrentRange();
            var currentSelection = this.getCurrentSelection();
            var startContainer = currentRange.startContainer,
                endContainer = currentRange.endContainer,
                commonAncestorContainer = currentRange.commonAncestorContainer;


            if (currentSelection.isCollapsed || startContainer.nodeType === Node.TEXT_NODE && endContainer.nodeType === Node.TEXT_NODE) {
                return;
            }

            var rangeString = currentRange.toString();

            var newRange = contextDocument.createRange();

            var walker = contextDocument.createTreeWalker(commonAncestorContainer, NodeFilter.SHOW_TEXT, null, false);

            var textNodes = [];
            while (walker.nextNode()) {
                textNodes.push(walker.currentNode);
            }

            var firstTextNode = textNodes[0];
            var lastTextNode = textNodes[textNodes.length - 1];

            newRange.setStart(firstTextNode, 0);
            newRange.setEnd(lastTextNode, lastTextNode.textContent.length);

            var currentNodeIndex = 0;
            var newStartOffset = 0;
            var currentTextNode = textNodes[currentNodeIndex];

            while (newRange.compareBoundaryPoints(Range.START_TO_START, currentRange) < 0) {
                newStartOffset += 1;

                if (newStartOffset > currentTextNode.textContent.length) {
                    currentNodeIndex += 1;
                    newStartOffset = 0;

                    if (currentNodeIndex >= textNodes.length) {
                        break;
                    }
                    currentTextNode = textNodes[currentNodeIndex];
                }

                newRange.setStart(currentTextNode, newStartOffset);
            }

            var newEndOffset = newStartOffset;
            newRange.setEnd(currentTextNode, newEndOffset);

            while (newRange.compareBoundaryPoints(Range.END_TO_END, currentRange) < 0) {
                newEndOffset += 1;
                if (newEndOffset > currentTextNode.textContent.length) {
                    currentNodeIndex += 1;
                    newEndOffset = 0;

                    if (currentNodeIndex >= textNodes.length) {
                        break;
                    }
                    currentTextNode = textNodes[currentNodeIndex];
                }

                newRange.setEnd(currentTextNode, newEndOffset);
            }

            if (newRange.toString() === rangeString) {
                this.updateRange(newRange, { silent: true });
            }
        }
    },

    spansMultipleBlocks: function spansMultipleBlocks() {
        var _getCurrentSelection = this.getCurrentSelection(),
            anchorNode = _getCurrentSelection.anchorNode,
            focusNode = _getCurrentSelection.focusNode;

        var rootElem = this.getRootElement();
        var blockTagNames = Toolbar$2.getBlockTags();

        var anchorBlock = DOM.getClosestInArray(anchorNode, blockTagNames, rootElem);
        var focusBlock = DOM.getClosestInArray(focusNode, blockTagNames, rootElem);

        return anchorBlock !== focusBlock;
    }
});

var canvasStyles = ".typester-canvas {\n  position: fixed;\n  top: 0;\n  left: 0;\n  height: 0;\n  width: 0;\n  opacity: 0; }\n";

// jshint strict: false

/**
* @access protected
*/
var Canvas = Module({
    name: 'Canvas',
    props: {
        iframe: null,
        relativeRange: null,
        alreadyContainered: false,
        cachedSelection: null
    },
    handlers: {
        requests: {
            'canvas:document': 'getCanvasDocument',
            'canvas:window': 'getCanvasWindow',
            'canvas:body': 'getCanvasBody',
            'canvas:formatted:block': 'getFormattedBlock',
            'canvas:selection:coordinates': 'getSelectionCoordinates',
            'canvas:selection': 'getSelection',
            'canvas:selection:in:or:contains': 'selectionInOrContains'
        },
        commands: {
            'canvas:content': 'setContent',
            'canvas:insert:range': 'insertRange',
            'canvas:insert:node': 'insertNode',
            'canvas:select:all': 'selectAll',
            'canvas:select:by:coordinates': 'selectByCoordinates',
            'canvas:import:selection': 'importSelection',
            'canvas:export:prep': 'exportPrep',
            'canvas:export:all': 'exportAll',
            'canvas:cache:selection': 'cacheSelection',
            'canvas:select:cachedSelection': 'selectCachedSelection',
            'canvas:select:ensure:offsets': 'ensureSelectionOffsets'
        },
        events: {
            'app:destroy': 'destroy'
        }
    },
    methods: {
        init: function init() {
            this.appendStyles();
            this.createIframe();
        },
        appendStyles: function appendStyles() {
            var props = this.props;

            props.styles = DOM.addStyles(canvasStyles);
        },
        createIframe: function createIframe() {
            var _this = this;

            var mediator = this.mediator;

            var iframe = document.createElement('iframe');

            iframe.classList.add('typester-canvas');
            iframe.onload = function () {
                _this.setCanvasBodyEditable();
                _this.applyPolyfills();
                mediator.emit('canvas:created');
            };

            this.props.iframe = iframe;
            document.body.appendChild(iframe);
        },
        clearIframe: function clearIframe() {
            var canvasBody = this.getCanvasBody();
            canvasBody.innerHTML = '';
        },
        reset: function reset() {
            var props = this.props;

            props.relativeRange = null;
            props.alreadyContainered = false;
            props.cachedSelection = null;
            this.clearIframe();
        },
        cacheSelection: function cacheSelection() {
            var props = this.props,
                mediator = this.mediator;


            mediator.exec('selection:ensure:text:only');

            var _mediator$get = mediator.get('selection:current'),
                anchorNode = _mediator$get.anchorNode,
                anchorOffset = _mediator$get.anchorOffset,
                focusNode = _mediator$get.focusNode,
                focusOffset = _mediator$get.focusOffset;

            props.cachedSelection = {
                anchorNode: anchorNode,
                anchorOffset: anchorOffset,
                focusNode: focusNode,
                focusOffset: focusOffset
            };
        },
        selectCachedSelection: function selectCachedSelection() {
            var props = this.props,
                mediator = this.mediator;
            var _props$cachedSelectio = props.cachedSelection,
                anchorNode = _props$cachedSelectio.anchorNode,
                anchorOffset = _props$cachedSelectio.anchorOffset,
                focusNode = _props$cachedSelectio.focusNode,
                focusOffset = _props$cachedSelectio.focusOffset;


            var canvasDoc = this.getCanvasDocument();
            var newRange = canvasDoc.createRange();

            newRange.setStart(anchorNode, anchorOffset);
            newRange.setEnd(focusNode, focusOffset);

            mediator.exec('selection:update:range', newRange);
        },
        ensureSelectionOffsets: function ensureSelectionOffsets() {
            var props = this.props,
                mediator = this.mediator;


            if (!props.cachedSelection) {
                return;
            }

            var _mediator$get2 = mediator.get('selection:current'),
                currentAnchorNode = _mediator$get2.anchorNode,
                currentAnchorOffset = _mediator$get2.anchorOffset,
                currentFocusNode = _mediator$get2.focusNode,
                currentFocusOffset = _mediator$get2.focusOffset;

            var _props$cachedSelectio2 = props.cachedSelection,
                cachedAnchorOffset = _props$cachedSelectio2.anchorOffset,
                cachedFocusOffset = _props$cachedSelectio2.focusOffset;


            var anchorOffsetMismatch = currentAnchorOffset !== cachedAnchorOffset;
            var focusOffsetMismatch = currentFocusOffset !== cachedFocusOffset;

            if (anchorOffsetMismatch || focusOffsetMismatch) {
                var canvasDoc = this.getCanvasDocument();
                var newRange = canvasDoc.createRange();

                newRange.setStart(currentAnchorNode, cachedAnchorOffset);
                newRange.setEnd(currentFocusNode, cachedFocusOffset);

                mediator.exec('selection:update:range', newRange);
            }
        },
        setCanvasBodyEditable: function setCanvasBodyEditable() {
            var props = this.props;

            var canvasBody = props.iframe.contentDocument.body;
            canvasBody.contentEditable = true;
        },
        applyPolyfills: function applyPolyfills() {
            var canvasWindow = this.getCanvasWindow();
            if (canvasWindow.NodeList && !canvasWindow.NodeList.prototype.forEach) {
                canvasWindow.NodeList.prototype.forEach = function (callback, thisArg) {
                    thisArg = thisArg || canvasWindow;
                    for (var i = 0; i < this.length; i++) {
                        callback.call(thisArg, this[i], i, this);
                    }
                };
            }
        },


        // Handlers
        getCanvasDocument: function getCanvasDocument() {
            var props = this.props;

            return props.iframe.contentDocument;
        },
        getCanvasWindow: function getCanvasWindow() {
            var props = this.props;

            return props.iframe.contentWindow;
        },
        getCanvasBody: function getCanvasBody() {
            var props = this.props;

            return props.iframe.contentDocument.body;
        },
        setContent: function setContent(html) {
            var canvasDoc = this.getCanvasDocument();

            if (html instanceof Array) {
                this.reset();
                html.forEach(function (node) {
                    canvasDoc.body.appendChild(node);
                });
            } else {
                canvasDoc.body.innerHTML = html;
            }
        },
        insertRange: function insertRange(range) {
            var rangeDocFrag = range.cloneContents();
            var canvasBody = this.getCanvasBody();

            this.reset();

            for (var i = 0; i < rangeDocFrag.childNodes.length; i++) {
                var childNode = rangeDocFrag.childNodes[i];
                if (childNode.nodeType === Node.TEXT_NODE && (!/\w+/.test(childNode.textContent) || zeroWidthSpace.assert(childNode))) {
                    rangeDocFrag.removeChild(childNode);
                }
            }

            canvasBody.appendChild(rangeDocFrag);
        },
        insertNode: function insertNode(node) {
            var nodeClone = node.cloneNode(true);
            var canvasBody = this.getCanvasBody();
            this.reset();
            canvasBody.appendChild(nodeClone);
        },
        selectAll: function selectAll() {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var mediator = this.mediator;

            mediator.exec('selection:select:all', opts);
        },
        selectByCoordinates: function selectByCoordinates(rangeCoordinates) {
            var mediator = this.mediator;

            var canvasBody = this.getCanvasBody();

            mediator.exec('selection:set:el', canvasBody);
            mediator.exec('selection:select:coordinates', rangeCoordinates);
        },
        importSelection: function importSelection() {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var mediator = this.mediator;

            var rangeCoordinates = void 0;

            if (opts.toRoot) {
                rangeCoordinates = mediator.get('selection:range:relative:toroot');
                mediator.exec('selection:expand:toroot');
            }

            var selectionRange = mediator.get('selection:range');

            this.insertRange(selectionRange);
            if (opts.toRoot) {
                this.selectByCoordinates(rangeCoordinates);
            } else {
                this.selectAll();
            }
            this.setCanvasBodyEditable();
        },
        exportPrep: function exportPrep() {
            this.cleanHtml();
        },
        exportAll: function exportAll() {
            var mediator = this.mediator;

            var canvasBody = this.getCanvasBody();
            // this.exportPrep();

            var innerHTML = canvasBody.innerHTML;
            innerHTML = innerHTML.replace(/\s{2,}/g, ' ');
            innerHTML = innerHTML.replace(/\r?\n|\r/g, '');

            mediator.exec('contenteditable:inserthtml', innerHTML);
        },
        getFormattedBlock: function getFormattedBlock() {
            var mediator = this.mediator;

            mediator.exec('selection:expand:toroot');
            var blockRange = mediator.get('selection:range');
            return blockRange.cloneContents();
        },
        cleanHtml: function cleanHtml() {
            var canvasDoc = this.getCanvasDocument();
            var canvasBody = this.getCanvasBody();
            var walker = canvasDoc.createTreeWalker(canvasBody, NodeFilter.SHOW_ALL, null, false);

            var allNodes = [];

            while (walker.nextNode()) {
                allNodes.push(walker.currentNode);
            }

            for (var i = allNodes.length - 1; i >= 0; i--) {
                var node = allNodes[i];

                if (!node.textContent || !node.textContent.trim().length || zeroWidthSpace.assert(node)) {
                    DOM.removeNode(node);
                } else if (node.classList && node.classList.contains('typester-replace-default')) {
                    var defaultNode = document.createElement('p');
                    DOM.insertAfter(defaultNode, node);
                    defaultNode.appendChild(node);
                    DOM.unwrap(node);
                }if (node.classList && node.classList.contains('typester-container') || node.nodeName === 'SPAN' && node.hasAttribute('style') || node.nodeName === 'FONT' || node.nodeName === 'DIV') {
                    DOM.unwrap(node);
                }
            }
        },
        getSelection: function getSelection() {
            var mediator = this.mediator;

            return mediator.get('selection:current');
        },
        getSelectionCoordinates: function getSelectionCoordinates() {
            var mediator = this.mediator;

            return mediator.get('selection:range:coordinates');
        },
        selectionInOrContains: function selectionInOrContains(selectors) {
            var mediator = this.mediator;

            return mediator.get('selection:in:or:contains', selectors);
        },
        destroy: function destroy() {
            var props = this.props;
            var iframe = props.iframe;

            iframe.parentNode.removeChild(iframe);
        }
    }
});

// jshint strict: false


/**
 * CanvasContainer - This container bootstraps the Selection and Canvas modules.
 * It requires only a mediator instance to delegate events to.
 *
 * @access protected
 * @module containers/CanvasContainer
 *
 * @requires core/Container
 * @requires modules/Selection
 * @requires modules/Canvas
 *
 * @example
 * new CanvasContainer({
 *   mediator: mediatorInstance
 * });
 */

/**
 * @constructor CanvasContainer
 * @param {object} opts={} - instance options
 * @param {object} opts.mediator - The mediator to delegate events up to
 * @return {container} CanvasContainer instance
 */
var CanvasContainer = Container({
    name: 'CanvasContainer',

    /**
     * Child Modules: [{@link modules/Selection}, {@link modules/Canvas}]
     * @enum {Array<{class:Module}>} modules
     */
    modules: [{ class: Selection }, { class: Canvas }],

    /**
     * @prop {object} mediatorOpts - Container specific mediator options. For the
     * CanvasContainer the mediator is set to conceal, and not propagate, any messages
     * from the selection module. This is to avoid cross contamination with the selection
     * module used on the page.
     */
    mediatorOpts: {
        conceal: [/selection:.*?/]
    },

    /**
     * @prop {object} handlers
     * @prop {object} handlers.events - canvas:created -> handleCanvasCreated
     */
    handlers: {
        events: {
            'canvas:created': 'handleCanvasCreated'
        }
    },
    methods: {
        init: function init() {},


        /**
         * @func handleCanvasCreated
         * @desc Listens for the canvas:create event to do some bootstrapping between
         * the canvas and selection module instances
         * @listens canvas:created
         */
        handleCanvasCreated: function handleCanvasCreated() {
            var mediator = this.mediator;

            var canvasWin = mediator.get('canvas:window');
            var canvasDoc = mediator.get('canvas:document');
            var canvasBody = mediator.get('canvas:body');

            mediator.exec('selection:set:contextWindow', canvasWin);
            mediator.exec('selection:set:contextDocument', canvasDoc);
            mediator.exec('selection:set:el', canvasBody);
        }
    }
});

/**
* @access protected
*/
var keycodes = {
    ENTER: 13,
    BACKSPACE: 8,
    TAB: 9
};

var contentEditableStyles = ".typester-content-editable[data-placeholder]:before {\n  content: attr(data-placeholder);\n  display: none;\n  color: #a0a0a0;\n  position: absolute; }\n\n.typester-content-editable[data-placeholder].show-placeholder:before {\n  display: block; }\n";

// jshint strict: false

/**
 * ContentEditable
 *
 * A module to handle everything that happens in the primary contenteditable=true dom element
 *
 * @access protected
 * @module modules/ContentEditable
 */

/**
* @event contenteditable:focus
* @desc Emitted by {@link modules/ContentEditable} when focused.
*/

/**
 * @requires core/Module
 * @requires utils/DOM
 * @requires utils/keycodes
 */
/**
 * @constructor ContentEditable
 *
 * @param  {object} opts - instance options
 * @param  {object} opts.dom - The dom components used by this module
 * @param  {element} opts.dom.el - The root dom element for this module
 * @param  {mediator} opts.mediator - The mediator this module can use to communicate with
 *
 * @return {container} AppContainer instance
 */
var ContentEditable = Module({
    name: 'ContentEditable',
    props: {
        styles: null,
        cleanupTimeout: null
    },
    dom: {},
    handlers: {
        requests: {
            'contenteditable:element': 'getContentEditableElement',
            'contenteditable:toolbar:buttons': 'getToolbarButtons'
        },
        commands: {
            'contenteditable:inserthtml': 'insertHTML',
            'contenteditable:refocus': 'reFocus',
            'contenteditable:cleanup': 'cleanup'
        },
        domEvents: {
            'focus': 'handleFocus',
            'keydown': 'handleKeydown',
            'keyup': 'handleKeyup',
            'blur': 'handleBlur',
            'paste': 'handlePaste',
            'mouseover': 'handleMouseOver',
            'mouseout': 'handleMouseOut',
            'click': 'handleClick',
            'input': 'handleInput'
        }
    },
    methods: {
        setup: function setup() {
            this.appendStyles();
        },
        init: function init() {
            this.ensureClass();
            this.ensureEditable();
            this.updatePlaceholderState();
            this.updateValue();
        },
        appendStyles: function appendStyles() {
            var props = this.props;

            props.styles = DOM.addStyles(contentEditableStyles);
        },
        ensureClass: function ensureClass() {
            var dom = this.dom;

            dom.el[0].classList.add('typester-content-editable');
        },
        updatePlaceholderState: function updatePlaceholderState() {
            var dom = this.dom;

            var rootEl = dom.el[0];

            if (rootEl.hasAttribute('data-placeholder')) {
                if (rootEl.childNodes.length && rootEl.textContent.trim().length) {
                    rootEl.classList.remove('show-placeholder');
                } else {
                    rootEl.classList.add('show-placeholder');
                }
            }
        },
        updateValue: function updateValue() {
            var dom = this.dom;

            var rootEl = dom.el[0];

            if (rootEl.innerText.trim().length) {
                rootEl.value = rootEl.innerHTML;
            } else {
                rootEl.value = '';
            }
        },
        ensureEditable: function ensureEditable() {
            var dom = this.dom;

            var rootEl = dom.el[0];

            if (!rootEl.hasAttribute('contenteditable')) {
                rootEl.contentEditable = true;
            }
        },
        ensureDefaultBlock: function ensureDefaultBlock() {
            var dom = this.dom,
                mediator = this.mediator;

            var rootEl = dom.el[0];

            if (!/\w+/.test(rootEl.textContent)) {
                rootEl.innerHTML = '<p>&nbsp;</p>';
                mediator.exec('selection:select:contents', rootEl.childNodes[0]);
            }
        },
        getToolbarButtons: function getToolbarButtons() {
            var dom = this.dom;
            var toolbarButtons = dom.el[0].dataset.toolbarButtons;

            var buttonArray = [];

            if (toolbarButtons) {
                buttonArray = JSON.parse(toolbarButtons);
            }

            return buttonArray;
        },
        insertHTML: function insertHTML(html) {
            var mediator = this.mediator;


            if (document.queryCommandSupported('insertHTML')) {
                document.execCommand('insertHTML', null, html);
            } else {
                var currentSelection = mediator.get('selection:current');
                var currentRange = mediator.get('selection:range');

                currentRange.deleteContents();

                var tmpContainer = document.createElement('container');
                tmpContainer.innerHTML = html;

                var docFrag = document.createDocumentFragment();
                var node = void 0,
                    lastNode = void 0;

                while (node = tmpContainer.firstChild) {
                    lastNode = docFrag.appendChild(node);
                }
                currentRange.insertNode(docFrag);

                if (lastNode) {
                    currentRange = currentRange.cloneRange();
                    currentRange.setStartAfter(lastNode);
                    currentRange.collapse(true);
                    currentSelection.removeAllRanges();
                    currentSelection.addRange(currentRange);
                }
            }
        },
        reFocus: function reFocus() {
            var dom = this.dom;

            dom.el[0].focus();
        },
        getContentEditableElement: function getContentEditableElement() {
            var dom = this.dom;

            return dom.el[0];
        },
        cleanup: function cleanup() {
            var dom = this.dom,
                mediator = this.mediator;

            var rootEl = dom.el[0];
            mediator.exec('format:clean', rootEl);
        },
        setCleanupTimeout: function setCleanupTimeout() {
            var _this = this;

            var props = this.props;

            props.cleanupTimeout = setTimeout(function () {
                _this.cleanup();
            }, 250);
        },
        clearCleanupTimeout: function clearCleanupTimeout() {
            var props = this.props;

            if (props.cleanupTimeout) {
                clearTimeout(props.cleanupTimeout);
                props.cleanupTimeout = null;
            }
        },


        // DOM Event Handlers

        /**
         * On dom focus do some stuff and then let the rest of the app know.
         *
         * @method handleFocus
         * @fires contenteditable:focus
         */
        handleFocus: function handleFocus() {
            var mediator = this.mediator;

            this.clearCleanupTimeout();
            this.ensureDefaultBlock();
            this.updatePlaceholderState();
            mediator.emit('contenteditable:focus');
        },
        handleKeyup: function handleKeyup(evnt) {
            var mediator = this.mediator,
                dom = this.dom;

            var keyCode = evnt.which || evnt.keyCode;
            var anchorNode = mediator.get('selection:anchornode');

            function CustomEvent(event, params) {
                var evt;
                params = params || { bubbles: true, cancelable: true, detail: undefined };
                evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            }

            switch (keyCode) {
                case keycodes.ENTER:
                    setTimeout(function () {
                        mediator.emit('contenteditable:newline');
                    }, 100);
                    break;
                case keycodes.BACKSPACE:
                    if (!anchorNode.textContent.trim().length || anchorNode.hasAttribute && anchorNode.hasAttribute('contenteditable')) {
                        mediator.emit('contenteditable:newline');
                    }
                    break;
                case keycodes.TAB:
                    mediator.emit('contenteditable:tab:up', evnt);
                    break;
            }

            dom.el[0].dispatchEvent(new CustomEvent('change'));

            this.updateValue();
            this.updatePlaceholderState();
        },
        handleKeydown: function handleKeydown(evnt) {
            var _this2 = this;

            var mediator = this.mediator;

            var keyCode = evnt.which || evnt.keyCode;

            setTimeout(function () {
                _this2.updatePlaceholderState();
            }, 25);

            switch (keyCode) {
                case keycodes.TAB:
                    mediator.emit('contenteditable:tab:down', evnt);
                    break;
            }
        },
        handleBlur: function handleBlur() {
            var mediator = this.mediator;

            this.updatePlaceholderState();
            this.updateValue();
            this.setCleanupTimeout();
            mediator.emit('contenteditable:blur');
        },
        handlePaste: function handlePaste(evnt) {
            var mediator = this.mediator;

            mediator.emit('contenteditable:paste', evnt);
            this.updateValue();
        },
        handleMouseOver: function handleMouseOver(evnt) {
            var mediator = this.mediator;

            if (evnt.target.nodeName === 'A') {
                mediator.emit('contenteditable:mouseover:anchor', evnt);
            }
        },
        handleMouseOut: function handleMouseOut(evnt) {
            var mediator = this.mediator;

            if (evnt.target.nodeName === 'A') {
                mediator.emit('contenteditable:mouseout:anchor', evnt);
            }
        },
        handleClick: function handleClick(evnt) {
            var dom = this.dom;

            var rootEl = dom.el[0];

            if (DOM.isIn(evnt.target, 'A', rootEl)) {
                evnt.preventDefault();
                evnt.stopPropagation();
            }
        },
        handleInput: function handleInput() {
            this.updateValue();
        }
    }
});

// jshint strict: false

/**
 * AppContainer - The top most container for the Typester app stack. This
 * container sets up the {@link FormatterContainer}, {@link UIContainer},
 * and {@link CanvasContainer} containers which are treated as singletons.
 *
 * @access protected
 * @module containers/AppContainer
 *
 * @requires core/Container
 * @requires containers/UIContainer
 * @requires containers/FormatterContainer
 * @requires containers/CanvasContainer
 * @requires modules/ContentEditable
 * @requires modules/Selection
 *
 * @example
 * new AppContainer({
 *   dom: {
 *     el: domElement
 *   }
 * });
 */

var uiContainer = void 0;
var formatterContainer = void 0;
var canvasContainer = void 0;

/**
 * @constructor AppContainer
 * @param  {object} opts={} - instance options
 * @param  {object} opts.dom - The dom components used by Typester
 * @param  {element} opts.dom.el - The dom element to be the canvas for Typester
 * @return {container} AppContainer instance
 */
var AppContainer = Container({
    name: 'AppContainer',

    /**
     * Child modules: [{@link modules/ContentEditable}, {@link modules/Selection}]
     * @enum {Array<{class:Module}>} modules
     */
    modules: [{
        class: ContentEditable
    }, {
        class: Selection
    }],

    /**
     * @prop {Object} handlers
     * @prop {Object} handlers.events - AppContainer listens to events from {@link ContentEditable}
     */
    handlers: {
        events: {
            'contenteditable:focus': 'handleFocus',
            'contenteditable:blur': 'handleBlur'
        }
    },
    methods: {
        /**
         * @func setup
         * @desc Initializes the {@link FormatterContainer} and provides a mediator
         * to attach to.
         * @protected
         */
        setup: function setup() {
            var mediator = this.mediator;

            formatterContainer = formatterContainer || new FormatterContainer({ mediator: mediator });
            uiContainer = uiContainer || new UIContainer({ mediator: mediator });
            canvasContainer = canvasContainer || new CanvasContainer({ mediator: mediator });
        },

        /**
         * Nothing to see here.
         * @func init
         * @ignore
         */
        init: function init() {
            // Current nothing to init for this container. Method left here for ref.
        },


        /**
         * Because the {@link FormatterContainer}, {@link UIContainer},
         * and {@link CanvasContainer} containers are intended to be singletons
         * they need to communicate through the current active mediator instance.
         *
         * @method handleFocus
         * @listens contenteditable:focus
         */
        handleFocus: function handleFocus() {
            var mediator = this.mediator;

            uiContainer.setMediatorParent(mediator);
            formatterContainer.setMediatorParent(mediator);
            canvasContainer.setMediatorParent(mediator);
        },


        /**
         * Nothing to see here.
         * @func handleBlur
         * @ignore
         */
        handleBlur: function handleBlur() {
            // Should the container require to do anything in particular here
        }
    }
});

// jshint strict: false
/* eslint-disable no-alert, no-console */

/**
 * Tyester - Public interface to instatiate a Typester instance bound to a
 * dom element
 *
 * @access public
 * @param  {object} opts={} - instance options
 * @param  {object} opts.dom - The dom components used by Typester
 * @param  {element} opts.dom.el - The dom element to be the canvas for Typester
 * @return {appContainer} AppContainer instance
 *
 * @example
 * new Typester({
 *   dom: {
 *     el: domElement
 *   }
 * });
 */
var Typester = function Typester() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return new AppContainer({ dom: { el: opts.el } });
};

return Typester;

})));
//# sourceMappingURL=typester.js.map
