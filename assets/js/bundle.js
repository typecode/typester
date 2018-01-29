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
        animatedScroll: {
            duration: 800
        }
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

        scrollTo: function scrollTo (elem) {
            var animatedScroll = internal.animatedScroll;

            var start = fn.scrollTop();
            var to = elem.offsetTop;
            var change = to - start;
            var duration = animatedScroll.duration;
            var startTime = Date.now();

            var animateScroll = function () {
                var elapsedTime = Date.now() - startTime;
                var newScrollTop = ease(elapsedTime, start, change, duration);
                fn.scrollTop(newScrollTop);

                if (elapsedTime < duration) {
                    requestAnimationFrame(animateScroll);
                }
            };

            var ease = function (t, b, c, d) {
                t /= d/2;
                if (t < 1) { return c / 2 * t * t + b; }
                t--;
                return 0 - c / 2 * (t * (t - 2) - 1) + b;
            };

            animateScroll();
        },

        // Private
        newAnimationObj: function newAnimationObj (elem, callback) {
            var animationObj = {
                elem: elem,
                callback: callback,
                bounds: {},
                inView: false,
                observer: null,
                stop: function stop () {
                    fn.stop(this);
                }
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

        stop: function stop (animationObj) {
            var animations = internal.animations;
            var animIndex = animations.indexOf(animationObj);
            animations.splice(animIndex, 1);
        },

        //Utils
        updateScrollPosition: function updateScrollPosition () {
            var scrollTop = fn.scrollTop();

            internal.scroll = {
                top: scrollTop,
                bottom: scrollTop + document.body.offsetHeight,
                height: document.body.offsetHeight
            };
        },

        scrollTop: function scrollTop (setVal) {
            if ( setVal === void 0 ) setVal = null;

            var doc = document.documentElement;
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

var Nav = function (ref) {
    var animation = ref.animation;

    var navEl = document.querySelector('nav');
    var navControlEl = navEl.querySelector('.nav-control');
    var navPanelEl = navEl.querySelector('.nav-panel');
    var linkEls = document.querySelectorAll('a[href]');

    var state = {
        open: false
    };

    var scrollToSection = function (sectionHash) {
        var linkTargetEl = document.querySelector(sectionHash);
        animation.scrollTo(linkTargetEl);
    };

    navControlEl.addEventListener('click', function () {
        state.open = !state.open;

        if (state.open) {
            navEl.classList.add('open');
        } else {
            navEl.classList.remove('open');
        }
    });

    linkEls.forEach(function (linkEl) {
        if (!linkEl.hash) { return; }
        linkEl.addEventListener('click', function (evnt) {
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

var Hero = function (opts) {
    var animation = opts.animation;

    var heroSectionEl = document.querySelector('section.hero');
    var titlesEl = heroSectionEl.querySelector('.titles');

    var prevScrollTop = null;
    var heroScroll = function (opts) {
        var scroll = opts.scroll;
        var bounds = opts.bounds;
        if (scroll.top === prevScrollTop) { return; }

        var offsetTop = bounds.top - scroll.top;
        var travelDist = scroll.height * 0.6;
        var scrollRatio = offsetTop / bounds.height;
        var travelRatio = travelDist * scrollRatio;

        heroSectionEl.style.opacity = scrollRatio < -0.6 ? 1.3 + scrollRatio : 1;
        titlesEl.style.transform = 'translateY(' + Math.round(0 - travelRatio) + 'px)';

        prevScrollTop = scroll.top;
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
    var heroAnimation = animation.animate(heroSectionEl, heroScroll);
};

var History = function (ref) {
    var animation = ref.animation;

    var historySectionEl = document.querySelector('.history');
    var historyAnimation = animation.animate(historySectionEl, function (ref) {
        var scroll = ref.scroll;
        var bounds = ref.bounds;

        if (scroll.top >= bounds.top - scroll.height * 0.3) {
            historySectionEl.classList.add('show-icon');
            historyAnimation.stop();
        }
    });
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
        var inlineContent = ['H1', 'H2', 'UL', 'OL', 'A', 'SPAN', 'B', 'I'].indexOf(tagName) > -1;

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

    var textNodes = [];
    var editablePaneHTML = editablePaneEl.innerHTML;
    var textNode;

    editablePaneEl.style.height = editablePaneEl.offsetHeight + 'px';

    var h1Clone = editablePaneEl.querySelector('h1').cloneNode(true);
    editablePaneEl.innerHTML = '';
    editablePaneEl.appendChild(h1Clone);
    editablePaneEl.classList.add('typing-in');

    var textWalker = document.createTreeWalker(editablePaneEl.querySelector('h1'), NodeFilter.SHOW_TEXT, null, false);

    while (textNode = textWalker.nextNode()) {
        textNodes.push({
            charArray: Array.from(textNode.textContent),
            node: textNode,
            delay: textNodes.length * 100
        });
        textNode.textContent = '';
    }

    var skippedFrames = 0;
    var typeInEffect = function () {
        if (skippedFrames < 2) {
            skippedFrames++;
            requestAnimationFrame(typeInEffect);
            return;
        }
        skippedFrames = 0;

        var textNode = textNodes[0];
        textNode.node.textContent += textNode.charArray.shift();

        if (!textNode.charArray.length) {
            textNodes.shift();
        }

        if (textNodes.length) {
            requestAnimationFrame(typeInEffect);
        } else {
            setTimeout(finishTypeInEffect, 200);
        }
    };

    var finishTypeInEffect = function () {
        editablePaneEl.innerHTML = editablePaneHTML;
        editablePaneEl.style.height = 'auto';
        requestAnimationFrame(function () {
            editablePaneEl.classList.remove('typing-in');
        });
    };

    var startTypeInEffect = function (ref) {
        var scroll = ref.scroll;
        var bounds = ref.bounds;

        console.log(scroll.top, bounds.top - scroll.height / 2 );
        if (scroll.top >= bounds.top - scroll.height / 2) {
            typeInEffect();
            typeInAnimation.stop();
        }
    };

    var typeInAnimation = animation.animate(demoSectionEl, startTypeInEffect);
};

var Install = function (opts) {
    var animation = opts.animation;

    var installSectionEl = document.querySelector('section.install');
    var contentWrapperEl = installSectionEl.querySelector('.content-wrapper');

    var prevScrollTop = null;
    var installScroll = function (opts) {
        var scroll = opts.scroll;
        var bounds = opts.bounds;

        if (scroll.top === prevScrollTop) { return; }

        var offsetTop = bounds.top - scroll.top;
        var travelDist = Math.round(scroll.height * 0.1);
        var scrollRatio = offsetTop / bounds.height;
        var travelRatio = travelDist * scrollRatio;

        contentWrapperEl.style.opacity = Math.min(1, 1 - scrollRatio);
        contentWrapperEl.style.transform = "translateY(" + (Math.round(0 - offsetTop - travelRatio)) + "px)";

        prevScrollTop = scroll.top;
    };

    animation.animate(installSectionEl, installScroll);
};

// Utils
var animation = Animation();
animation.start();

[
    Nav,
    Hero,
    History,
    Demo,
    Install
].forEach(function (Module) {
    Module({
        animation: animation
    });
});

}());
