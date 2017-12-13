module.exports = {
    'Ensure correct setup': function (browser) {
        browser
            .url('http://app/')
            .waitForElementVisible('.content-editable', 1000)
            .waitForElementPresent('.typester-toolbar', 1000)
            .waitForElementPresent('.typester-canvas', 1000)
            .assert.attributeEquals('.content-editable', 'contenteditable', 'true')
            .end();
    }
};
