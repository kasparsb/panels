import addStyle from 'dom-helpers/src/addStyle';
import addClass from 'dom-helpers/src/addClass';
import append from 'dom-helpers/src/append';
import removeClass from 'dom-helpers/src/removeClass'

let el, visible = false, currentProgress;

function init() {
    createEl();
}

/**
 * Izveidojam overlay elementu un ieliekam body tagā
 */
function createEl() {
    el = document.createElement('div');
    el.className = 'overlay';
    append('body', el)
}

function beforeShow() {
    visible = true;

    applyProgress(0)
    addClass(el, 'overlay--visible-step1');
}

function beforeHide() {
    visible = false;
}

function afterHide() {
    removeClass(el, 'overlay--visible-step1');
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

export default {
    init,
    beforeShow,
    beforeHide,
    afterHide,
    applyProgress,
    isVisible,
    getProgress() {
        return currentProgress
    },
    setZIndex(i) {
        addStyle(el, {
            zIndex: i
        })
    }
}