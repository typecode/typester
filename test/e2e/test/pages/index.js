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
        }
    },

    selectAll: function () {
        this.api
            .click('.content-editable p', assertClick)
            .keys([this.api.Keys.CONTROL, 'a'])

        return this.waitForElementVisible('.typester-toolbar', 1000)
    },

    clickToolbarButton: function (configKey) {
        return this.click('.typester-menu-item[data-config-key="' + configKey + '"]', assertClick);
    },

    assertOutputContent: function (outputContentKey, contentSourceKey) {
        this.api
            .execute(function () {
                return document.getElementById('content-editable').innerHTML;
            }, [], function (editedHTML) {
                this.assert.strictEqual(editedHTML.value, sampleContent[(contentSourceKey || 'output')][outputContentKey])
            })
        return this;
    }
};

module.exports = {
    url: 'http://app/',
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
