const Animation = function (opts) {
    const internal = {
        boundsCheckInterval: 100,
        animations: [],
        scroll: {
            top: 0,
            bottom: 0
        },
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

        // Private
        newAnimationObj (elem, callback) {
            const animationObj = {
                elem,
                callback,
                bounds: {},
                inView: false,
                observer: null
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

        //Utils
        updateScrollPosition () {
            const doc = document.documentElement;
            const scrollTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0)

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

export default Animation;
