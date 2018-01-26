const History = function ({ animation }) {
    const historySectionEl = document.querySelector('.history');
    const historyAnimation = animation.animate(historySectionEl, ({ scroll, bounds }) => {
        if (scroll.top >= bounds.top - scroll.height * 0.3) {
            historySectionEl.classList.add('show-icon');
            historyAnimation.stop();
        }
    });
};

export default History;
