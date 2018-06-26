// jshint strict: false

import Mediator from '../../../src/scripts/core/Mediator';
import BaseFormatter from '../../../src/scripts/modules/BaseFormatter';
import Selection from '../../../src/scripts/modules/Selection';
import ContentEditable from '../../../src/scripts/modules/ContentEditable';
import CanvasContainer from '../../../src/scripts/containers/CanvasContainer';
import Config from '../../../src/scripts/modules/Config';
import Commands from '../../../src/scripts/modules/Commands';

const formatterSetup = function (Formatter, opts={}) {
    let $editableEl = jQuery('.content-editable');
    let editableEl = $editableEl[0];

    let mediator = new Mediator();

    new Selection({ mediator, dom: {el: editableEl}});
    new Config({ mediator });
    new Commands({ mediator });
    new ContentEditable({ mediator, dom: {el: editableEl}});
    new CanvasContainer({ mediator });
    if (!opts.skipBaseFormatter) {
        new BaseFormatter({ mediator });
    }

    new Formatter({ mediator });

    return {
        editableEl,
        mediator
    };
};

export default formatterSetup;
