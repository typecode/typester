const Hero = function (opts) {
    const { animation } = opts;

    const heroSectionEl = document.querySelector('section.hero');
    const titlesEl = heroSectionEl.querySelector('.titles');

    let prevScrollTop = null;
    const heroScroll = function (opts) {
        const { scroll, bounds } = opts;
        if (scroll.top === prevScrollTop) { return; }

        const offsetTop = bounds.top - scroll.top;
        const travelDist = scroll.height * 0.6;
        const scrollRatio = offsetTop / bounds.height;
        const travelRatio = travelDist * scrollRatio;

        heroSectionEl.style.opacity = scrollRatio < -0.6 ? 1.3 + scrollRatio : 1;
        titlesEl.style.transform = 'translateY(' + Math.round(0 - travelRatio) + 'px)';

        prevScrollTop = scroll.top;
    };

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
    const heroAnimation = animation.animate(heroSectionEl, heroScroll);
};

export default Hero;
