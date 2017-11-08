// jshint strict: false

import Container from '../../../src/scripts/core/Container.js';

describe('core/Container', () => {
    let container, moduleInstances, ContainerClass;

    const mockModule = function (id) {
        return function (opts) {
            const requestResponse = `Request response module${id}`;

            moduleInstances[`module${id}`] = this;
            opts.mediator.registerHandler('request', `request:module${id}`, () => {
                return requestResponse;
            });

            Object.assign(this, {
                name: `module${id}`,
                getMediator () {
                    return opts.mediator;
                },
                doRequest (id) {
                    return opts.mediator.request(`request:module${id}`);
                },
                getRequestResponse () {
                    return requestResponse;
                }
            });
        };
    };

    const mockContainerObj = function (id) {
        return {
            name: `Container-${id}`,
            modules: [],
            containers: [],
            init () {}
        };
    };

    beforeEach(() => {
        let ModuleA, ModuleB, containerObj, nestedContainerObj, NestedModule;

        moduleInstances = {};
        ModuleA = mockModule('A');
        ModuleB = mockModule('B');
        containerObj = mockContainerObj('A');

        nestedContainerObj = mockContainerObj('Nested');
        NestedModule = mockModule('Nested');

        containerObj.modules.push({
            class: ModuleA,
            opts: {
                optA: true
            }
        });
        containerObj.modules.push({
            class: ModuleB,
            opts: {
                optB: true
            }
        });
        containerObj.containers.push({
            class: Container(nestedContainerObj),
            opts: {

            }
        });
        nestedContainerObj.modules.push({
            class: NestedModule,
            opts: {
                optNested: true
            }
        });

        ContainerClass = Container(containerObj);
        container = new ContainerClass();
    });

    xit('should be an instance of its constructor', () => {
        expect(container instanceof ContainerClass).toBe(true);
    });

    it('should instantiate its modules', () => {
        expect(moduleInstances.moduleA).toBeDefined();
        expect(moduleInstances.moduleB).toBeDefined();
    });

    it('should instantiate a mediator and share it with its modules', () => {
        const moduleAMediator = moduleInstances.moduleA.getMediator();
        const moduleBMediator = moduleInstances.moduleB.getMediator();

        expect(moduleAMediator).toBe(moduleBMediator);
        expect(typeof moduleAMediator.request).toBe('function');
        expect(typeof moduleAMediator.exec).toBe('function');
        expect(typeof moduleAMediator.emit).toBe('function');
    });

    it('should facilitate cross module communication through its shared mediator', () => {
        const moduleARequestResponse = moduleInstances.moduleA.doRequest('B');
        const moduleBRequestResponse = moduleInstances.moduleB.getRequestResponse();

        expect(moduleARequestResponse).toBe(moduleBRequestResponse);
    });

    it('should instantiate nested containers', () => {
        expect(moduleInstances.moduleNested).toBeDefined();
    });

    it('should facilityate cross module communication across the tree of nested containers', () => {
        const moduleARequestResponse = moduleInstances.moduleA.doRequest('Nested');
        const moduleNestedRequestResponse = moduleInstances.moduleNested.getRequestResponse();

        expect(moduleARequestResponse).toBe(moduleNestedRequestResponse);
    });
});
