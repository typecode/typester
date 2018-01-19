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
                attributes: true,
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
                height: elemBounds.height,
                width: elemBounds.width,
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

var Hero = function (opts) {
    var animation = opts.animation;

    var heroSectionEl = document.querySelector('section.hero');
    var titlesEl = heroSectionEl.querySelector('.titles');

    var heroScroll = function (opts) {
        var scroll = opts.scroll;
        var bounds = opts.bounds;

        var offsetTop = bounds.top - scroll.top;
        var travelDist = scroll.height * 0.6;
        var scrollRatio = offsetTop / bounds.height;
        var travelRatio = travelDist * scrollRatio;

        heroSectionEl.style.opacity = scrollRatio < -0.6 ? 1.3 + scrollRatio : 1;
        titlesEl.style.transform = 'translateY(' + Math.round(0 - travelRatio) + 'px)';
    };

    var setSelection = function () {
        var selection = window.getSelection();
        var newRange = new Range();
        var mainTitleH1 = heroSectionEl.querySelector('.main-title h1');
        var h1TextNode = mainTitleH1.firstChild;

        newRange.setStart(h1TextNode, 0);
        newRange.setEnd(h1TextNode, 4);
        selection.removeAllRanges();
        selection.addRange(newRange);
    };

    setTimeout(setSelection, 300);
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

    var openTag = function (elem) {
        var tagString = '';

        tagString += '<span class="tag">';
        tagString += '&lt;';
        tagString += elem.tagName.toLowerCase();

        for (var i = 0; i < elem.attributes.length; i++) {
            var attribute = elem.attributes[i];
            tagString += ' ' + attribute.name + '="' + attribute.value + '"';
        }

        tagString += '&gt;';
        tagString += '</span>';

        return tagString;
    };

    var closeTag = function (elem) {
        var tagString = '';

        tagString += '<span class="tag">';
        tagString += '&lt;/';
        tagString += elem.tagName.toLowerCase();
        tagString += '&gt;';
        tagString += '</span>';

        return tagString;
    };

    var elemToCodeStr = function (elem, indent, parentIsBlock) {
        if (elem.nodeType === Node.ELEMENT_NODE && !elem.childNodes.length) {
            return openTag(elem) + '</span><span class="code-line">';
        }
        if (!elem.textContent.trim().length) { return ''; }
        var elemHTML = '';
        var tagName = elem.tagName;
        var isBlockTag = ['H1', 'H2', 'P', 'UL', 'OL', 'LI', 'BLOCKQUOTE'].indexOf(tagName) > -1;
        var inlineContent = ['H1', 'H2', 'UL', 'OL', 'A', 'SPAN'].indexOf(tagName) > -1;

        if (isBlockTag) {
            elemHTML += '<span class="code-line">';
        }

        if (elem.nodeType !== Node.ELEMENT_NODE) {
            elemHTML += elem.textContent.replace(/\s+/g, ' ');
        } else {
            elemHTML += openTag(elem);
            if (!inlineContent) {
                elemHTML += '<span class="code-line">';
            }
            for (var i = 0; i < elem.childNodes.length; i++) {
                elemHTML += elemToCodeStr(elem.childNodes[i], indent + 1, isBlockTag);
            }
            if (!inlineContent) {
                elemHTML += '</span>';
            }
            elemHTML += closeTag(elem);
        }

        if (isBlockTag) {
            elemHTML += '</span>';
        }
        return elemHTML;
    };

    var updateCodeDisplay = function () {
        var codeDisplayHTML = '';
        for (var i = 0; i < editablePaneEl.childNodes.length; i++) {
            codeDisplayHTML += elemToCodeStr(editablePaneEl.childNodes[i], 0);
        }
        codeEl.innerHTML = codeDisplayHTML;
    };

    var editObserver = new MutationObserver(updateCodeDisplay);
    editObserver.observe(editablePaneEl, {
        childList: true,
        characterData: true,
        attributes: true,
        subtree: true
    });
    updateCodeDisplay();
};

// Utils
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
