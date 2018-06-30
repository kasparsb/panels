var addCssClass = require('./addCssClass');
var removeCssClass = require('./removeCssClass');

var el, visible = false;

function init() {
    createEl();
}

/**
 * Izveidojam overlay elementu un ieliekam body tagā
 */
function createEl() {
    el = document.createElement('div');
    el.className = 'overlay';
    document.getElementsByTagName('body')[0].appendChild(el)
}

function beforeShow() {
    visible = true;

    applyProgress(0)
    addCssClass(el, 'overlay--visible-step1');
}

function beforeHide() {
    visible = false;
}

function afterHide() {
    removeCssClass(el, 'overlay--visible-step1');
}

function applyProgress(p) {
    el.style.opacity = p;
}

function isVisible() {
    return visible;
}

module.exports = {
    init: init,
    beforeShow: beforeShow,
    beforeHide: beforeHide,
    afterHide: afterHide,
    applyProgress: applyProgress,
    isVisible: isVisible
}