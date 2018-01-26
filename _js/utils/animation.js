const Animation = function (opts) {
    const internal = {
        boundsCheckInterval: 100,
        animations: [],
        scroll: {
            top: 0,
            bottom: 0
        },
        animatedScroll: {
            duration: 800
        }
    };

    const fn = {
        // Public
        animate (elem, callback) {
            const animationObj = fn.newAnimationObj(elem, callback);
            internal.animations.push(animationObj);
            return animationObj;
        },

        start () {
            fn.updateScrollPosition();
            window.requestAnimationFrame(fn.runAnimations);
            document.body.onresize = () => {
                fn.checkElemBounds();
            };
        },

        scrollTo (elem) {
            const { animatedScroll } = internal;

            const start = fn.scrollTop();
            const to = elem.offsetTop;
            const change = to - start;
            const duration = animatedScroll.duration;
            const startTime = Date.now();

            const animateScroll = function () {
                let elapsedTime = Date.now() - startTime;
                const newScrollTop = ease(elapsedTime, start, change, duration);
                fn.scrollTop(newScrollTop);
                console.log(ease(elapsedTime, start, change, duration));
                if (elapsedTime < duration) {
                    requestAnimationFrame(animateScroll);
                }
            };

            const ease = function (t, b, c, d) {
                t /= d/2;
                if (t < 1) { return c / 2 * t * t + b; }
                t--;
                return 0 - c / 2 * (t * (t - 2) - 1) + b;
            };

            animateScroll();
        },

        // Private
        newAnimationObj (elem, callback) {
            const animationObj = {
                elem,
                callback,
                bounds: {},
                inView: false,
                observer: null,
                stop () {
                    fn.stop(this);
                }
            };

            animationObj.observer = new MutationObserver(() => {
                fn.updateAnimationObjBounds(animationObj);
            });

            animationObj.observer.observe(elem, {
                childList: true,
                characterData: true,
                attributes: true,
                subtree: true
            });

            fn.updateAnimationObjBounds(animationObj);

            return animationObj;
        },

        runAnimations () {
            const { animations } = internal;
            fn.updateScrollPosition();
            animations.forEach(animationObj => {
                if (fn.isInView(animationObj)) {
                    animationObj.callback({
                        scroll: internal.scroll,
                        bounds: animationObj.bounds
                    });
                }
            });
            window.requestAnimationFrame(fn.runAnimations);
        },

        checkElemBounds () {
            const { animations } = internal;
            animations.forEach(fn.updateAnimationObjBounds);
        },

        updateAnimationObjBounds (animationObj) {
            const { scroll } = internal;
            const elemBounds = animationObj.elem.getBoundingClientRect();

            let calculatedBounds = {
                top: elemBounds.top + scroll.top,
                right: elemBounds.right,
                bottom: elemBounds.bottom + scroll.top,
                left: elemBounds.left,
                height: elemBounds.height,
                width: elemBounds.width,
                x: elemBounds.x,
                y: elemBounds.y + scroll.top
            };

            animationObj.bounds = calculatedBounds;
        },

        isInView (animationObj) {
            const { scroll } = internal;
            return animationObj.bounds.top < scroll.bottom && animationObj.bounds.bottom > scroll.top;
        },

        stop (animationObj) {
            const { animations } = internal;
            const animIndex = animations.indexOf(animationObj);
            animations.splice(animIndex, 1);
        },

        //Utils
        updateScrollPosition () {
            const scrollTop = fn.scrollTop();

            internal.scroll = {
                top: scrollTop,
                bottom: scrollTop + document.body.offsetHeight,
                height: document.body.offsetHeight
            };
        },

        scrollTop (setVal = null) {
            const doc = document.documentElement;
            if (!setVal) {
                return (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
            } else {
                doc.scrollTop = setVal;
            }
        }
    };

    return {
        animate: fn.animate,
        start: fn.start,
        scrollTo: fn.scrollTo
    };
};

export default Animation;
