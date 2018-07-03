// jshint strict: false

import ListFormatter from '../../../src/scripts/modules/ListFormatter';
import toolbarConfig from '../../../src/scripts/config/toolbar';

import formatterSetup from '../helpers/formatterSetup';
import userInputHelper from '../helpers/userInput';
import selectionHelper from '../helpers/selection';

describe('modules/ListFormatter', function () {
    let mediator;
    let orderedListOpts, unorderedListOpts;
    let editableEl;

    const setEditableElHTML = function () {
        const tmpDiv = document.createElement('div');
        for (let i = 0; i < 5; i++) {
            let pTag = document.createElement('p');
            pTag.innerHTML = `List item (${i})`;
            tmpDiv.appendChild(pTag);
        }
        editableEl.innerHTML = tmpDiv.innerHTML;
        userInputHelper.focus(editableEl);
        selectionHelper.selectFirstAndLastTextNodes(editableEl);
    };

    beforeEach((done) => {
        loadFixtures('index.html');

        const setupComponents = formatterSetup(ListFormatter);
        editableEl = setupComponents.editableEl;
        mediator = setupComponents.mediator;

        orderedListOpts = toolbarConfig.buttonConfigs.orderedlist.opts;
        unorderedListOpts = toolbarConfig.buttonConfigs.unorderedlist.opts;

        setTimeout(done, 250);
    });

    afterEach(() => {
        editableEl.innerHTML = '';
        mediator.emit('app:destroy');
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    });

    it('should toggle ordered lists', () => {
        setEditableElHTML();
        expect(editableEl.getElementsByTagName('ol').length).toBe(0);
        expect(editableEl.getElementsByTagName('li').length).toBe(0);

        console.log('---------------------------------------------------------------------------------------[2:start]')
        selectionHelper.selectFirstAndLastTextNodes(editableEl);
        console.log(document.getSelection().toString());
        mediator.exec('format:list', orderedListOpts);
        console.log('---------------------------------------------------------------------------------------[2:end]')
        expect(editableEl.getElementsByTagName('ol').length).toBe(1);
        expect(editableEl.getElementsByTagName('li').length).toBe(5);

        console.log('---------------------------------------------------------------------------------------[2:start]')
        selectionHelper.selectFirstAndLastTextNodes(editableEl);
        console.log(document.getSelection().toString());
        mediator.exec('format:list', orderedListOpts);
        console.log('---------------------------------------------------------------------------------------[2:end]')
        expect(editableEl.getElementsByTagName('ol').length).toBe(0);
        expect(editableEl.getElementsByTagName('li').length).toBe(0);
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

    });

    it('should toggle unordered lists', () => {
        setEditableElHTML();
        expect(editableEl.getElementsByTagName('ul').length).toBe(0);
        expect(editableEl.getElementsByTagName('li').length).toBe(0);

        mediator.exec('format:list', unorderedListOpts);
        expect(editableEl.getElementsByTagName('ul').length).toBe(1);
        expect(editableEl.getElementsByTagName('li').length).toBe(5);

        selectionHelper.selectAll(editableEl.getElementsByTagName('ul')[0]);
        mediator.exec('format:list', unorderedListOpts);
        expect(editableEl.getElementsByTagName('ul').length).toBe(0);
        expect(editableEl.getElementsByTagName('li').length).toBe(0);
    });
});
