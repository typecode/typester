// jshint strict: false

import TextFormatter from '../../src/scripts/modules/TextFormatter';
import toolbarConfig from '../../src/scripts/config/toolbar';

import formatterSetup from '../helpers/formatterSetup';
import userInputHelper from '../helpers/userInput';
import selectionHelper from '../helpers/selection';

describe('modules/TextFormatter', function () {
    let mediator;
    let editableEl;

    beforeEach(function () {
        loadFixtures('index.html');

        const setupComponents = formatterSetup(TextFormatter);
        editableEl = setupComponents.editableEl;
        mediator = setupComponents.mediator;

        userInputHelper.focus(editableEl);
    });

    it('should toggle bold selection', function () {
        const textToBold = 'text to bold';
        const pTag = document.createElement('p');
        const config = toolbarConfig.buttonConfigs.bold;
        let textToBoldIndex;
        let isBold = false;
        let unBolded = false;

        pTag.innerHTML = 'Some text to bold!';
        editableEl.innerHTML = '';

        editableEl.appendChild(pTag);
        textToBoldIndex = pTag.innerHTML.indexOf(textToBold);
        selectionHelper.selectTextPortion(pTag.childNodes[0], textToBoldIndex, textToBoldIndex + textToBold.length);

        mediator.exec('format:text', config.opts);
        isBold = editableEl.innerHTML === '<p>Some <b>text to bold</b>!</p>' || editableEl.innerHTML === '<p>Some <strong>text to bold</strong>!</p>';
        expect(isBold).toBe(true);

        selectionHelper.selectAll(pTag.childNodes[1]);
        mediator.exec('format:text', config.opts);
        unBolded = editableEl.innerHTML === '<p>Some text to bold!</p>';
        expect(unBolded).toBe(true);
    });
});
