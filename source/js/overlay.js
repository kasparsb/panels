var addCssClass = require('./addCssClass');
var removeCssClass = require('./removeCssClass');

var el, visible = false, currentProgress;

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
    currentProgress = p;
    el.style.opacity = p;
}

function isVisible() {
    return visible;
}

function onClick(cb) {
    onClickCallbacks.push(cb);
}

module.exports = {
    init: init,
    beforeShow: beforeShow,
    beforeHide: beforeHide,
    afterHide: afterHide,
    applyProgress: applyProgress,
    isVisible: isVisible,
    getProgress: function() {
        return currentProgress
    }
}