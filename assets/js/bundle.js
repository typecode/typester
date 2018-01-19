(function () {
'use strict';

var Animation = function (opts) {
    var internal = {
        boundsCheckInterval: 100,
        animations: [],
        scroll: {
            top: 0,
            bottom: 0
        },
    };

    var fn = {
        // Public
        animate: function animate (elem, callback) {
            var animationObj = fn.newAnimationObj(elem, callback);
            internal.animations.push(animationObj);
            return animationObj;
        },

        start: function start () {
            fn.updateScrollPosition();
            window.requestAnimationFrame(fn.runAnimations);
            document.body.onresize = function () {
                fn.checkElemBounds();
            };
        },

        // Private
        newAnimationObj: function newAnimationObj (elem, callback) {
            var animationObj = {
                elem: elem,
                callback: callback,
                bounds: {},
                inView: false,
                observer: null
            };

            animationObj.observer = new MutationObserver(function () {
                fn.updateAnimationObjBounds(animationObj);
            });

            animationObj.observer.observe(elem, {
                childList: true,
                characterData: true,
                subtree: true
            });

            fn.updateAnimationObjBounds(animationObj);

            return animationObj;
        },

        runAnimations: function runAnimations () {
            var animations = internal.animations;
            fn.updateScrollPosition();
            animations.forEach(function (animationObj) {
                if (fn.isInView(animationObj)) {
                    animationObj.callback({
                        scroll: internal.scroll,
                        bounds: animationObj.bounds
                    });
                }
            });
            window.requestAnimationFrame(fn.runAnimations);
        },

        checkElemBounds: function checkElemBounds () {
            var animations = internal.animations;
            animations.forEach(fn.updateAnimationObjBounds);
        },

        updateAnimationObjBounds: function updateAnimationObjBounds (animationObj) {
            var scroll = internal.scroll;
            var elemBounds = animationObj.elem.getBoundingClientRect();

            var calculatedBounds = {
                top: elemBounds.top + scroll.top,
                right: elemBounds.right,
                bottom: elemBounds.bottom + scroll.top,
                left: elemBounds.left,
                x: elemBounds.x,
                y: elemBounds.y + scroll.top
            };

            animationObj.bounds = calculatedBounds;
        },

        isInView: function isInView (animationObj) {
            var scroll = internal.scroll;
            return animationObj.bounds.top < scroll.bottom && animationObj.bounds.bottom > scroll.top;
        },

        //Utils
        updateScrollPosition: function updateScrollPosition () {
            var doc = document.documentElement;
            var scrollTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

            internal.scroll = {
                top: scrollTop,
                bottom: scrollTop + document.body.offsetHeight,
                height: document.body.offsetHeight
            };
        }
    };

    return {
        animate: fn.animate,
        start: fn.start
    };
};



// const animation = {
//     animations: [],
//     animate (elem, callback) {
//         const animationObj = {
//             elem,
//             callback
//         };
//
//         animation.animations.push(animationObj);
//     },
//
//     runAnimations () {
//         animation.animations.forEach(animationObj => {
//             animationObj.callback();
//         });
//         window.requestAnimationFrame(animation.runAnimations);
//     },
//
//     processAnimationElems () {
//         const { animations } = animation;
//
//     },
//
//     start () {
//         window.requestAnimationFrame(animation.runAnimations);
//         setInterval(animation.processAnimationElems, 100);
//     }
// };
//
// export default animation;

var Hero = function (opts) {
    var animation = opts.animation;

    var heroSectionEl = document.querySelector('section.hero');
    var titlesEl = heroSectionEl.querySelector('.titles');

    var heroScroll = function (opts) {
        var scroll = opts.scroll;
        var bounds = opts.bounds;

        var offsetTop = bounds.top - scroll.top;
        var travelDist = scroll.height / 5;
        var scrollRatio = offsetTop / scroll.height;
        var travelRatio = travelDist * scrollRatio;

        heroSectionEl.style.opacity = 1 + scrollRatio * 1.75;
        titlesEl.style.transform = 'translateY(' + Math.round(0 - offsetTop - travelRatio) + 'px)';
    };

    animation.animate(heroSectionEl, heroScroll);
};

var Features = function (opts) {
    var animation = opts.animation;

    var features = document.querySelector('section.features');

    // animation.animate(features, () => { console.log('features animate!'); });
};

var Demo = function (opts) {
    var animation = opts.animation;

    var demoSectionEl = document.querySelector('section.demo');
    var editablePaneEl = demoSectionEl.querySelector('.demo-pane[contenteditable]');
    var codeEl = demoSectionEl.querySelector('.demo-pane code');

    var editObserver = new MutationObserver(function () { console.log('mutation!'); });
    editObserver.observe(editablePaneEl, {
        characterData: true,
        subtree: true
    });
};

// Utils
// Modules
var animation = Animation();
animation.start();

[
    Hero,
    Features,
    Demo
].forEach(function (Module) {
    Module({
        animation: animation
    });
});

}());
