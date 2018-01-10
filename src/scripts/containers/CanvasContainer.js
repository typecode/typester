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

import Container from '../core/Container';
import Selection from '../modules/Selection';
import Canvas from '../modules/Canvas';

/**
 * @constructor CanvasContainer
 * @param {object} opts={} - instance options
 * @param {object} opts.mediator - The mediator to delegate events up to
 * @return {container} CanvasContainer instance
 */
const CanvasContainer = Container({
    name: 'CanvasContainer',

    /**
     * Child Modules: [{@link modules/Selection}, {@link modules/Canvas}]
     * @enum {Array<{class:Module}>} modules
     */
    modules: [
        { class: Selection },
        { class: Canvas }
    ],


    /**
     * @prop {object} mediatorOpts - Container specific mediator options. For the
     * CanvasContainer the mediator is set to conceal, and not propagate, any messages
     * from the selection module. This is to avoid cross contamination with the selection
     * module used on the page.
     */
    mediatorOpts: {
        conceal: [
            /selection:.*?/
        ]
    },

    /**
     * @prop {object} handlers
     * @prop {object} handlers.events - canvas:created -> handleCanvasCreated
     */
    handlers: {
        events: {
            'canvas:created' : 'handleCanvasCreated'
        }
    },
    methods: {
        init () {
        },

        /**
         * @func handleCanvasCreated
         * @desc Listens for the canvas:create event to do some bootstrapping between
         * the canvas and selection module instances
         * @listens canvas:created
         */
        handleCanvasCreated () {
            const { mediator } = this;
            const canvasWin = mediator.get('canvas:window');
            const canvasDoc = mediator.get('canvas:document');
            const canvasBody = mediator.get('canvas:body');

            mediator.exec('selection:set:contextWindow', canvasWin);
            mediator.exec('selection:set:contextDocument', canvasDoc);
            mediator.exec('selection:set:el', canvasBody);
        }
    }
});

export default CanvasContainer;
