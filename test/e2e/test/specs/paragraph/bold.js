module.exports = {
    'Can toggle bold': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('paragraph')
            .assert.hidden('@toolbar')
            .selectAll()
            .clickToolbarButton('bold')
            .assertOutputContent('paragraphBold')
            .clickToolbarButton('bold')
            .assertOutputContent('paragraph', 'input');

        browser
            .pause(3000)
            .end()
    }
}
