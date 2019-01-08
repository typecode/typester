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
            .assertOutputContent('paragraph', 'input')

            .clickToolbarButton('bold')
            .assertOutputContent('paragraphBold')

            .end();
    },

    'Can toggle italic': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('paragraph')
            .assert.hidden('@toolbar')
            .selectAll()

            .clickToolbarButton('italic')
            .assertOutputContent('paragraphItalic')

            .clickToolbarButton('italic')
            .assertOutputContent('paragraph', 'input')

            .clickToolbarButton('italic')
            .assertOutputContent('paragraphItalic')

            .end();
    },

    'Can toggle H1': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('paragraph')
            .clickStartOfElem('.content-editable p')

            .keys(browser.Keys.ENTER)
            .clickStartOfElem('.content-editable p:first-child')
            .contentByKeys('line')
            .selectElement('.content-editable p:first-child')

            .pause(200)
            .clickToolbarButton('h1')
            .assertOutputContent('h1Paragraph')

            .pause(200)
            .clickToolbarButton('h1')
            .assertOutputContent('lineParagraph')

            .pause(200)
            .clickToolbarButton('h1')
            .assertOutputContent('h1Paragraph')

            .pause(200)
            .clickToolbarButton('h2')
            .assertOutputContent('h2Paragraph')

            .pause(3000)
            .end();
    },

    'Can toggle H2': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('paragraph')
            .clickStartOfElem('.content-editable p')

            .keys(browser.Keys.ENTER)
            .clickStartOfElem('.content-editable p:first-child')
            .contentByKeys('line')
            .selectElement('.content-editable p:first-child')

            .pause(200)
            .clickToolbarButton('h2')
            .assertOutputContent('h2Paragraph')

            .pause(200)
            .clickToolbarButton('h2')
            .assertOutputContent('lineParagraph')

            .pause(200)
            .clickToolbarButton('h2')
            .assertOutputContent('h2Paragraph')

            .pause(200)
            .clickToolbarButton('h1')
            .assertOutputContent('h1Paragraph')

            .pause(3000)
            .end();
    },

    'Can toggle blockquote': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('paragraph')
            .assert.hidden('@toolbar')
            .selectAll()

            .clickToolbarButton('quote')
            .assertOutputContent('paragraphBlockquote')

            .clickToolbarButton('quote')
            .assertOutputContent('paragraph', 'input')

            .clickToolbarButton('quote')
            .assertOutputContent('paragraphBlockquote')

            .end();
    },

    'Can create a link': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('paragraph')

            .clickStartOfElem('.content-editable p')
            .keys(browser.Keys.ENTER)
            .clickStartOfElem('.content-editable p:first-child')
            .contentByKeys('line')

            .selectSubstring('.content-editable p:first-child', 'ipsum dolor sit amet')
            .clickToolbarButton('link')
            .pause(100)
            .typeIn('http://link.test')
            .keys(browser.Keys.ENTER)

            .assertOutputContent('lineLinkParagraph')

            .pause(100)
            .clickToolbarButton('link')
            .assertOutputContent('lineParagraph')

            .end();
    },

    'Can toggle bold/italic': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('paragraph')
            .selectSubstring('.content-editable p', 'iaculis mi scelerisque')

            .clickToolbarButton('bold')
            .assertOutputContent('paragraphBoldSubstring')

            .clickToolbarButton('bold')
            .assertOutputContent('paragraph', 'input')

            .clickToolbarButton('italic')
            .assertOutputContent('paragraphItalicSubstring')

            .clickToolbarButton('italic')
            .assertOutputContent('paragraph', 'input')

            .logContent()

            .end();
    }
}
