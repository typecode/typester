// jshint strict: false

import Mediator from '../../../src/scripts/core/Mediator.js';

describe('core/Mediator', () => {
    let mediator;
    let requestHandlers, commandHandlers, eventHandlers, eventHandlers2;
    let requestResponse = 'Test request response';

    beforeEach(() => {
        mediator = new Mediator();

        requestHandlers = {
            testRequest: (suffix) => {
                return requestResponse + ':' + suffix;
            }
        };
        commandHandlers = {
            testCommand: () => {
                return null;
            }
        };
        eventHandlers = {
            testEvent: () => {
                return null;
            }
        };
        eventHandlers2 = {
            testEvent: () => {
                return null;
            }
        };

        spyOn(requestHandlers, 'testRequest').and.callThrough();
        spyOn(commandHandlers, 'testCommand').and.callThrough();
        spyOn(eventHandlers, 'testEvent').and.callThrough();
        spyOn(eventHandlers2, 'testEvent').and.callThrough();
    });

    it("should be defined", () => {
        expect(mediator).toBeDefined();
    });

    it("should handle request registrations", () => {
        mediator.registerRequestHandlers(requestHandlers);
        let mediatorResponse = mediator.request('testRequest', 'ping');
        expect(requestHandlers.testRequest).toHaveBeenCalled();
        expect(mediatorResponse).toEqual(requestResponse + ':ping');
    });

    it("should block duplicate request registrations", () => {
        mediator.registerRequestHandlers(requestHandlers);
        expect(() => {
            mediator.registerRequestHandlers(requestHandlers);
        }).toThrowError();
    });

    it("should handle command registrations", () => {
        mediator.registerCommandHandlers(commandHandlers);
        mediator.exec('testCommand');
        expect(commandHandlers.testCommand).toHaveBeenCalled();
    });

    it("should block duplicate command registrations", () => {
        mediator.registerCommandHandlers(commandHandlers);
        expect(() => {
            mediator.registerCommandHandlers(commandHandlers);
        }).toThrowError();
    });

    it("should handle event registrations", () => {
        mediator.registerEventHandlers(eventHandlers);
        mediator.registerEventHandlers(eventHandlers2);
        mediator.emit('testEvent');
        expect(eventHandlers.testEvent).toHaveBeenCalled();
        expect(eventHandlers2.testEvent).toHaveBeenCalled();
    });

    it("should allow for children mediators", () => {

    });

    it("should allow for a parent mediator", () => {

    });

    it("should delegate to parent if no handlers found", () => {

    });
});
