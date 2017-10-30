// jshint strict: false

import Container from '../core/Container';
import Selection from '../modules/Selection';
import Canvas from '../modules/Canvas';

const CanvasContainer = Container({
    name: 'CanvasContainer',
    modules: [
        { class: Selection },
        { class: Canvas }
    ],
    mediatorOpts: {
        conceal: [
            /selection:.*?/
        ]
    },
    handlers: {
        events: {
            'canvas:created' : 'handleCanvasCreated'
        }
    },
    methods: {
        init () {
        },

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
