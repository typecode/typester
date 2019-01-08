// jshint strict: false

import Context from '../../../src/scripts/core/Context';

describe('core/Context', () => {
    let methodA, methodB;
    let contextA, contextB;
    let newContext;

    beforeEach(() => {
        methodA = function () {
            return 'methodA';
        };
        methodB = function () {
            return 'methodB';
        };
        contextA = {
            keyA: 'valA',
            methodA
        };
        contextB = {
            keyB: 'valB',
            methodB
        };
        newContext = new Context(contextA, contextB);
    });

    it('should create a new context from provided contexts', () => {
        expect(newContext.keyA).toBe(contextA.keyA);
        expect(newContext.keyB).toBe(contextB.keyB);
        expect(newContext.methodA()).toBe(contextA.methodA());
        expect(newContext.methodB()).toBe(contextB.methodB());
    });

    it('should be extendable', () => {
        const methodC = function () {
            return 'methodC';
        };
        const contextC = {
            keyC: 'valC',
            methodC
        };
        const contextD = {
            keyD: 'valD',
            omittedKey: 'omittedVal'
        };

        newContext.extendWith(contextC);
        newContext.extendWith(contextD, {keys: ['keyD']});

        expect(newContext.keyC).toBe(contextC.keyC);
        expect(newContext.methodC()).toBe(contextC.methodC());
    });
});
