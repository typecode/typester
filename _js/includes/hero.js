const Hero = function (opts) {
    const { animation } = opts;

    const heroSectionEl = document.querySelector('section.hero');
    const titlesEl = heroSectionEl.querySelector('.titles');

    const heroScroll = function (opts) {
        const { scroll, bounds } = opts;

        const offsetTop = bounds.top - scroll.top;
        const travelDist = scroll.height / 5;
        const scrollRatio = offsetTop / scroll.height;
        const travelRatio = travelDist * scrollRatio;

        heroSectionEl.style.opacity = 1 + scrollRatio * 1.75;
        titlesEl.style.transform = 'translateY(' + Math.round(0 - offsetTop - travelRatio) + 'px)';
    };

    animation.animate(heroSectionEl, heroScroll);
};

export default Hero;
