var sampleContent = require('../helpers/sampleContent.js');
var assertClick = function (result) {
    this.assert.strictEqual(result.status, 0);
};

var pageCommands = {
    inputContent: function (contentKey) {
        this
            .waitForElementVisible('.content-editable', 1000)
        this.api.execute(function (sampleContent, contentKey) {
                document.getElementById('content-editable').innerHTML = sampleContent.input[contentKey]
            }, [sampleContent, contentKey]);

        switch(contentKey) {
            case 'paragraph':
                return this.waitForElementVisible('.content-editable p', 1000);
                break;
            case 'orderedlist':
                return this.waitForElementVisible('.content-editable ol', 1000);
                break;
            case 'unorderedlist':
                return this.waitForElementVisible('.content-editable ul', 1000);
                break;
        }
    },

    selectAll: function () {
        this.api
            .click('.content-editable p', assertClick)
            .keys([this.api.Keys.CONTROL, 'a'])

        return this.waitForElementVisible('.typester-toolbar', 1000)
    },

    clickToolbarButton: function (configKey) {
        this.api.pause(200);
        return this.click('.typester-menu-item[data-config-key="' + configKey + '"]', assertClick);
    },

    assertOutputContent: function (outputContentKey, contentSourceKey) {
        this.api.pause(200);
        this.api
            .execute(function () {
                return document.getElementById('content-editable').innerHTML;
            }, [], function (editedHTML) {
                this.assert.strictEqual(editedHTML.value, sampleContent[(contentSourceKey || 'output')][outputContentKey])
            })
        return this;
    },

    clickStartOfElem: function (selector) {
        var api = this.api;

        api.element('css selector', selector, (result) => {
            api
                .moveTo(result.value.ELEMENT, 0, 0)
                .mouseButtonClick();
        });

        return this;
    },

    clickEndOfElem: function (selector) {
        var api = this.api;

        api.element('css selector', selector, (result) => {
            api.elementIdSize(result.value.ELEMENT, (sizeResult) => {
                api
                    .moveTo(result.value.ELEMENT, 0, 0)
                    // .moveTo(result.value.ELEMENT, sizeResult.width - 1, sizeResult.height - 5)
                    .mouseButtonClick();
            });
        })

        return this;
    },

    contentByKeys: function (contentKey) {
        var textContent = sampleContent.input[contentKey].match(/<p>(.*?)<\/p>/)[1];
        this.typeIn(textContent);
        return this;
    },

    typeIn: function (string) {
        var api = this.api;
        var keyStrokes = string.split('');

        keyStrokes.forEach(function (keyStroke) {
            api.keys(keyStroke);
        });

        return this;
    },

    selectElement: function (selector) {
        var api = this.api;

        api.execute(function (selector) {

            var selection = document.getSelection();
            var newRange = new Range();
            var elem = document.querySelector(selector)

            newRange.selectNode(elem);

            selection.removeAllRanges();
            selection.addRange(newRange);

            return elem.innerHTML;
        }, [selector], function (response) {
            // console.log('elem', response);
        });

        return this;
    },

    selectSubstring: function (selector, substring) {
        var api = this.api;
        var assert = this.assert;

        api.execute(function (selector, substring) {
            var elem = document.querySelector(selector);
            var elemTextNode = elem.firstChild;
            var elemText = elem.innerText;
            var selection = document.getSelection();
            var newRange = new Range();
            var startOffset = elemText.indexOf(substring);
            var endOffset = startOffset + substring.length;

            newRange.setStart(elemTextNode, startOffset);
            newRange.setEnd(elemTextNode, endOffset);

            selection.removeAllRanges();
            selection.addRange(newRange);

            return selection.toString();
        }, [selector, substring], function (response) {
            assert.strictEqual(response.value, substring);
        });

        return this;
    },

    keys: function (keys) {
        this.api.keys(keys);
        return this;
    },

    setVal: function (selector, keys) {
        this.api.setValue(selector, keys);
        return this;
    },

    pause: function (duration) {
        this.api.pause(duration);
        return this;
    },

    end: function () {
        this.api.end();
        return this;
    },

    execute: function (execFn, args, callback) {
        this.api.execute(execFn, args, callback);
        return this;
    },

    logContent: function () {
        var api = this.api;
        api.pause(200);
        api.execute(function () {
            return document.querySelector('.content-editable').innerHTML;
        }, [], function (response) {
            console.log(response);
        });
        return this;
    },

    destroy: function () {
        var api = this.api;

        api.execute(function () {
            try {
                window.typesterInstance.destroy();
                return 'Destroyed!';
            } catch (e) {
                return e.message;
            }
        }, [], function (response) {
            console.log('Destroy:');
            console.log(response);
        });

        return this;
    }
};

module.exports = {
    url: 'http://test_app/',
    commands: [pageCommands],
    elements: {
        contentEditable: {
            selector: '.content-editable'
        },
        toolbar: {
            selector: '.typester-toolbar'
        }
    }
};
