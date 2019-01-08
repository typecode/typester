// jshint strict: false

import Mediator from '../../../src/scripts/core/Mediator';

import UIContainer from '../../../src/scripts/containers/UIContainer';
import FormatterContainer from '../../../src/scripts/containers/FormatterContainer';
import CanvasContainer from '../../../src/scripts/containers/CanvasContainer';

import ContentEditable from '../../../src/scripts/modules/ContentEditable';
import Selection from '../../../src/scripts/modules/Selection';
import Config from '../../../src/scripts/modules/Config';

import mockEvents from './mockEvents';

const e2eSetup = function () {
    let $editableEl = jQuery('.content-editable');
    let editableEl = $editableEl[0];
    let mediator = new Mediator();

    new ContentEditable({
        mediator,
        dom: { el: editableEl }
    });
    new Selection({
        mediator,
        dom: { el: editableEl }
    });
    new Config({ mediator });

    new FormatterContainer({ mediator });
    new UIContainer({ mediator });
    new CanvasContainer({ mediator });

    return {
        mediator,
        editableEl
    };
};

const e2eCleanOutput = function (editableEl) {
    let cleanOutput = '';

    if (!/\w+/.test(editableEl.firstChild.textContent)) {
        editableEl.removeChild(editableEl.firstChild);
    }
    if (!/\w+/.test(editableEl.lastChild.textContent)) {
        editableEl.removeChild(editableEl.lastChild);
    }

    cleanOutput = editableEl.innerHTML;

    // cleanOutput.match(/<(.*?)>/gi).forEach((tag) => {
    //     cleanOutput = cleanOutput.replace(tag, tag.toLowerCase());
    // });

    return cleanOutput;
};

const e2eClickToolbarButton = function (configKey) {
    jQuery('.typester-toolbar .typester-menu-item[data-config-key="' + configKey + '"]')[0].click();
};

const e2eSubmitInputForm = function (userInputValue) {
    const $form = jQuery('.typester-input-form');
    const $userInput = $form.find('.user-input');
    $userInput.val(userInputValue);
    mockEvents.submit($form[0]);
};

const e2eFirstTextNode = function (rootElem) {
    let firstTextNode = rootElem.firstChild;
    while (firstTextNode.nodeType !== Node.TEXT_NODE) {
        firstTextNode = firstTextNode.firstChild;
    }
    return firstTextNode;
};

export default e2eSetup;
export {
    e2eSetup,
    e2eCleanOutput,
    e2eClickToolbarButton,
    e2eSubmitInputForm,
    e2eFirstTextNode
};
