const Demo = function (opts) {
    const { animation } = opts;

    const demoSectionEl = document.querySelector('section.demo');
    const editablePaneEl = demoSectionEl.querySelector('.demo-pane[contenteditable]');
    const codeEl = demoSectionEl.querySelector('.demo-pane code');

    const editObserver = new MutationObserver(() => { console.log('mutation!'); });
    editObserver.observe(editablePaneEl, {
        characterData: true,
        subtree: true
    });
};

export default Demo;
