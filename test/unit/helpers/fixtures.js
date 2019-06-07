export const loadFixtures = function () {
    document.body.innerHTML = '';
    jQuery("<div class='content-editable'></div>").appendTo(document.body);
};

export default {
    loadFixtures
};