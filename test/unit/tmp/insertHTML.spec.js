// jshint strict: false

xdescribe('insertHTML', function () {
    let editableDiv;

    beforeEach(() => {
        editableDiv = document.createElement('div');
        document.body.appendChild(editableDiv);
        editableDiv.contentEditable = true;
        editableDiv.focus();
    });

    it('should detect if enabled', () => {
        expect(document.activeElement).toBe(editableDiv);
        expect(document.execCommand('insertHTML', null, '<p>123</p>')).toBe(true);
        expect(editableDiv.innerHTML).toBe('<p>123</p>');
    });
});
