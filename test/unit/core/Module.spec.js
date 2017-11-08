// jshint strict: false
import Mediator from '../../../src/scripts/core/Mediator.js';
import Module from '../../../src/scripts/core/Module.js';

describe('core/Module', () => {
    let mediator, ModuleClass, module;
    let requestHandlers, commandHandlers, eventHandlers;
    let moduleDefinition, moduleMethods, instanceProps;
    let domCache, $editableEl;
    let moduleRequestResponse = 'Module request response';

    beforeEach(() => {
        loadFixtures('index.html');

        requestHandlers = {
            moduleRequestHandler () {
                return this.moduleMethod();
            }
        };
        commandHandlers = {
            moduleCommandHandler () {
                return null;
            }
        };
        eventHandlers = {
            moduleEventHandler () {
                return null;
            }
        };
        moduleMethods = {
            init () {
                const { dom, props } = this;
                domCache = dom;
                instanceProps = props;
            },
            moduleMethod () {
                return moduleRequestResponse;
            },
            domEventHandler () {}
        };

        spyOn(requestHandlers, 'moduleRequestHandler').and.callThrough();
        spyOn(commandHandlers, 'moduleCommandHandler').and.callThrough();
        spyOn(eventHandlers, 'moduleEventHandler').and.callThrough();
        spyOn(moduleMethods, 'moduleMethod').and.callThrough();
        spyOn(moduleMethods, 'init').and.callThrough();
        spyOn(moduleMethods, 'domEventHandler').and.callThrough();

        Object.assign(moduleMethods, requestHandlers, commandHandlers, eventHandlers);

        moduleDefinition = {
            name: 'testModule',
            props: {
                moduleProp: null
            },
            dom: {
                'editableEl' : '.content-editable'
            },
            handlers: {
                requests: {
                    'module:request' : 'moduleRequestHandler'
                },
                commands: {
                    'module:command' : 'moduleCommandHandler'
                },
                events: {
                    'module:event'   : 'moduleEventHandler'
                },
                domEvents: {
                    'click @editableEl' : 'domEventHandler'
                }
            },
            methods: moduleMethods
        };

        ModuleClass = Module(moduleDefinition);
        mediator = new Mediator();
        module = new ModuleClass({
            mediator,
            props: {
                moduleProp: true
            }
        });

        $editableEl = jQuery('.content-editable');
    });

    it('should create a module constructor', () => {
        expect(ModuleClass).toBeDefined();
    });

    it('should call the defined init method', () => {
        expect(moduleMethods.init).toHaveBeenCalled();
    });

    it('should register request handlers with the mediator', () => {
        let mediatorResponse = mediator.request('module:request');
        expect(requestHandlers.moduleRequestHandler).toHaveBeenCalled();
        expect(mediatorResponse).toEqual(moduleRequestResponse);
    });

    it('should register command handlers with the mediator', () => {
        mediator.exec('module:command');
        expect(commandHandlers.moduleCommandHandler).toHaveBeenCalled();
    });

    it('should register event handlers with the mediator', () => {
        mediator.emit('module:event');
        expect(eventHandlers.moduleEventHandler).toHaveBeenCalled();
    });

    it('should find and cache DOM elements', () => {
        expect(domCache).toBeDefined();
        expect(domCache.editableEl[0]).toBe($editableEl[0]);
    });

    it('should biind dom event handlers to methods', () => {
        $editableEl.trigger('click');
        expect(moduleMethods.domEventHandler).toHaveBeenCalled();
    });

    it('should merge props', () => {
        expect(instanceProps.moduleProp).toBe(true);
    });

    it('should ensure require props are provided', () => {
        const ErrorModule = Module({
            name: 'ErrorModule',
            requiredProps: ['requiredProp'],
            props: {
                requiredProp: null
            }
        });

        const newErrorModule = function () {
            new ErrorModule({ mediator });
        };

        expect(newErrorModule).toThrowError('ErrorModule requires prop: requiredProp');
    });
});
