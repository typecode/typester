// Utils
import Animation from './utils/animation.js';

// Modules
import Nav from './includes/nav.js';
import Hero from './includes/hero.js';
import History from './includes/history.js';
import Demo from './includes/demo.js';
import Install from './includes/install.js';

const animation = Animation();
animation.start();

[
    Nav,
    Hero,
    History,
    Demo,
    Install
].forEach(Module => {
    Module({
        animation
    });
});