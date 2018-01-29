const Nav = function ({ animation }) {
    const navEl = document.querySelector('nav');
    const navControlEl = navEl.querySelector('.nav-control');
    const navPanelEl = navEl.querySelector('.nav-panel');
    const linkEls = document.querySelectorAll('a[href]');

    const state = {
        open: false
    };

    const scrollToSection = function (sectionHash) {
        const linkTargetEl = document.querySelector(sectionHash);
        animation.scrollTo(linkTargetEl);
    };

    navControlEl.addEventListener('click', () => {
        state.open = !state.open;

        if (state.open) {
            navEl.classList.add('open');
        } else {
            navEl.classList.remove('open');
        }
    });

    linkEls.forEach((linkEl) => {
        if (!linkEl.hash) { return; }
        linkEl.addEventListener('click', (evnt) => {
            scrollToSection(linkEl.hash);
        });
    });

    if (window.location.hash) {
        scrollToSection(window.location.hash);
        setTimeout(function () {
            scrollToSection(window.location.hash);
        }, 500);
    }
};

export default Nav;
