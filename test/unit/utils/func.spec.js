// jshint strict: false

import func from '../../../src/scripts/utils/func';

describe('utils/func', () => {
    let testFunc, testContext;

    beforeEach(() => {
        testFunc = function () {
            return this;
        };
        testContext = {
            context: 'test'
        };
    });

    it('should bind a function to a context', function () {
        const boundFunc = func.bind(testFunc, testContext);
        expect(boundFunc()).toBe(testContext);
    });

    it('should bind an object of functions to a context', function () {
        const boundFuncObj = func.bindObj({testFunc}, testContext);
        expect(boundFuncObj.testFunc()).toBe(testContext);
    });
});
