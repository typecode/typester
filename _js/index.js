// Utils
import Animation from './utils/animation.js';

// Modules
import Hero from './includes/hero.js';
import Features from './includes/features.js';
import Demo from './includes/demo.js';

const animation = Animation();
animation.start();

[
    Hero,
    Features,
    Demo
].forEach(Module => {
    Module({
        animation
    });
});
