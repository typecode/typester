module.exports = {
    'Ensure correct setup': function (browser) {
        browser
            .url('http://test_app/')
            .execute(function () {
                return document.querySelector('body').innerHTML;
            }, [], function (response) {
                console.log(response);
            })
            .waitForElementVisible('.content-editable', 1000)
            .waitForElementPresent('.typester-toolbar', 1000)
            .waitForElementPresent('.typester-canvas', 1000)
            .assert.attributeEquals('.content-editable', 'contenteditable', 'true')
            .end();
    },

    'Destroy': function (browser) {
        var page = browser.page.index();

        page.navigate()
            .assert.elementPresent('.typester-toolbar')
            .assert.elementPresent('.typester-canvas')
            .destroy()
            .assert.elementNotPresent('.typester-toolbar')
            .assert.elementNotPresent('.typester-canvas');
    }
};
