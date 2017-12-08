module.exports = {
    'Can create/toggle OL': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('paragraph')
            .assert.hidden('@toolbar')
            .selectAll()
            .clickToolbarButton('orderedlist')
            .assertOutputContent('orderedList')
            .clickToolbarButton('orderedlist')
            .assertOutputContent('paragraph', 'input')
            .clickToolbarButton('orderedlist')
            .assertOutputContent('orderedList')
            .setVal('.content-editable', [browser.Keys.RIGHT_ARROW])
            .setVal('.content-editable', [browser.Keys.RETURN])
            .contentByKeys('line')
            .assertOutputContent('orderedListParagraphLine')
            .end();
    },

    'Can create/toggle UL': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('paragraph')
            .assert.hidden('@toolbar')
            .selectAll()
            .clickToolbarButton('unorderedlist')
            .assertOutputContent('unorderedList')
            .clickToolbarButton('unorderedlist')
            .assertOutputContent('paragraph', 'input')
            .clickToolbarButton('unorderedlist')
            .assertOutputContent('unorderedList')
            .setVal('.content-editable', [browser.Keys.RIGHT_ARROW])
            .setVal('.content-editable', [browser.Keys.RETURN])
            .contentByKeys('line')
            .assertOutputContent('unorderedListParagraphLine')
            .end();
    },

    'Can create/toggle OL on new line': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('paragraph')
            .selectAll()
            .setVal('.content-editable', [browser.Keys.RIGHT_ARROW])
            .setVal('.content-editable', [browser.Keys.RETURN])
            .contentByKeys('line')

            .selectElement('.content-editable p:last-child')
            .clickToolbarButton('orderedlist')
            .assertOutputContent('paragraphOrderedList')

            .clickToolbarButton('orderedlist')
            .assertOutputContent('paragraphLine')

            .end();
    },

    'Can create/toggle UL on new line': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('paragraph')
            .selectAll()
            .setVal('.content-editable', [browser.Keys.RIGHT_ARROW])
            .setVal('.content-editable', [browser.Keys.RETURN])
            .contentByKeys('line')

            .selectElement('.content-editable p:last-child')
            .clickToolbarButton('unorderedlist')
            .assertOutputContent('paragraphUnorderedList')

            .clickToolbarButton('unorderedlist')
            .assertOutputContent('paragraphLine')

            .end();
    },

    'Can toggle off a single ordered list item': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('orderedlist')
            .selectElement('.content-editable ol')
            .setVal('.content-editable', [browser.Keys.RIGHT_ARROW])
            .setVal('.content-editable', [browser.Keys.RETURN])
            .contentByKeys('line')

            .assertOutputContent('orderedListThreeItems')
            .selectElement('.content-editable li:last-child')
            .clickToolbarButton('orderedlist')
            .assertOutputContent('orderedListTwoItemsLine')

            .clickToolbarButton('h1')
            .assertOutputContent('orderedListTwoItemsH1')

            .clickToolbarButton('orderedlist')
            .assertOutputContent('orderedListThreeItems')

            .clickToolbarButton('orderedlist')
            .assertOutputContent('orderedListTwoItemsLine')

            .clickToolbarButton('h2')
            .assertOutputContent('orderedListTwoItemsH2')


            .end();
    },

    'Can toggle off a single unordered list item': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('unorderedlist')
            .selectElement('.content-editable ul')
            .setVal('.content-editable', [browser.Keys.RIGHT_ARROW])
            .setVal('.content-editable', [browser.Keys.RETURN])
            .contentByKeys('line')

            .assertOutputContent('unorderedListThreeItems')
            .selectElement('.content-editable li:last-child')
            .clickToolbarButton('unorderedlist')
            .assertOutputContent('unorderedListTwoItemsLine')

            .clickToolbarButton('h1')
            .assertOutputContent('unorderedListTwoItemsH1')

            .clickToolbarButton('unorderedlist')
            .assertOutputContent('unorderedListThreeItems')

            .clickToolbarButton('unorderedlist')
            .assertOutputContent('unorderedListTwoItemsLine')

            .clickToolbarButton('h2')
            .assertOutputContent('unorderedListTwoItemsH2')

            .end();
    },

    'Double return in orderedlist will create a new p tag': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('orderedlist')
            .selectElement('.content-editable ol')
            .setVal('.content-editable', [browser.Keys.RIGHT_ARROW])
            .setVal('.content-editable', [browser.Keys.RETURN])
            .assertOutputContent('orderedListTwoItemsEmptyItem')

            .setVal('.content-editable', [browser.Keys.ENTER])
            .assertOutputContent('orderedListTwoItemsEmptyParagraph')

            .end();
    },

    'Double return in unorderedlist will create a new p tag': function (browser) {
        var page = browser.page.index();

        page
            .navigate()
            .inputContent('unorderedlist')
            .selectElement('.content-editable ul')
            .setVal('.content-editable', [browser.Keys.RIGHT_ARROW])
            .setVal('.content-editable', [browser.Keys.RETURN])
            .assertOutputContent('unorderedListTwoItemsEmptyItem')

            .setVal('.content-editable', [browser.Keys.ENTER])
            .assertOutputContent('unorderedListTwoItemsEmptyParagraph')

            .end();
    }
}
