const Nav = function ({ animation }) {
    const navEl = document.querySelector('nav');
    const navControlEl = navEl.querySelector('.nav-control');
    const navPanelEl = navEl.querySelector('.nav-panel');
    const linkEls = document.querySelectorAll('a[href]');

    const state = {
        open: false
    };

    console.log(linkEls);

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
        const linkTargetEl = document.querySelector(linkEl.hash);
        linkEl.addEventListener('click', (evnt) => {
            evnt.preventDefault();
            animation.scrollTo(linkTargetEl);
        });
    })
};

export default Nav;
