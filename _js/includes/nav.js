const Nav = function ({ animation }) {
    const navEl = document.querySelector('nav');
    const navControlEl = navEl.querySelector('.nav-control');
    const navPanelEl = navEl.querySelector('.nav-panel');
    const state = {
        open: false
    };

    navControlEl.addEventListener('click', () => {
        state.open = !state.open;

        if (state.open) {
            navEl.classList.add('open');
        } else {
            navEl.classList.remove('open');
        }
    });
};

export default Nav;
