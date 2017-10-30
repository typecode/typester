// jshint strict: false

import Mediator from '../../src/scripts/core/Mediator.js';
import Flyout from '../../src/scripts/modules/Flyout.js';

describe('modules/Flyout', function () {
    let mediator;

    beforeEach(() => {
        mediator = new Mediator();
        new Flyout({ mediator });
    });

    afterEach(() => {
        mediator.emit('app:destroy');
        mediator = null;
    });

    it('should return a new dom instance of itself', () => {
        let flyoutDocInstance, flyout;

        flyout = mediator.get('flyout:new');
        flyout.show();
        flyoutDocInstance = jQuery('.typester-flyout');

        expect(flyout).toBeDefined();
        expect(flyout.el.nodeType).toBe(Node.ELEMENT_NODE);
        expect(flyoutDocInstance.length).toBe(1);
    });
});
