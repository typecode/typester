const Hero = function (opts) {
    const heroSectionEl = document.querySelector('section.hero');
    const titlesEl = heroSectionEl.querySelector('.titles');

    const setSelection = function () {
        const selection = window.getSelection();
        const newRange = new Range();
        const mainTitleH1 = heroSectionEl.querySelector('.main-title h1');
        const h1TextNode = mainTitleH1.firstChild;

        newRange.setStart(h1TextNode, 0);
        newRange.setEnd(h1TextNode, 4);
        selection.removeAllRanges();
        selection.addRange(newRange);
    };

    setTimeout(setSelection, 300);
};

export default Hero;
