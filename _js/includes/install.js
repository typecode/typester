const Install = function (opts) {
    const { animation } = opts;

    const installSectionEl = document.querySelector('section.install');
    const contentWrapperEl = installSectionEl.querySelector('.content-wrapper');

    let prevScrollTop = null;
    const installScroll = function (opts) {
        const { scroll, bounds } = opts;

        if (scroll.top === prevScrollTop) { return; }

        const offsetTop = bounds.top - scroll.top;
        const travelDist = Math.round(scroll.height * 0.1);
        const scrollRatio = offsetTop / bounds.height;
        const travelRatio = travelDist * scrollRatio;

        contentWrapperEl.style.opacity = Math.min(1, 1 - scrollRatio);
        contentWrapperEl.style.transform = `translateY(${ Math.round(0 - offsetTop - travelRatio) }px)`;

        prevScrollTop = scroll.top;
    };

    animation.animate(installSectionEl, installScroll);
};

export default Install;
