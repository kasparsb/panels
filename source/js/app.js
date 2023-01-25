import BodyScroll from './bodyScrollDisable';
import Overlay from './overlay';
import Manager from './manager';

let isInit = false;

function checkInitBeforeCall(cb, args) {
    if (!isInit) {
        init();
        isInit = true;
    }

    return cb.apply(this, args);
}

function init() {
    BodyScroll.init();
    Overlay.init();
    Manager.init();
}

export default {
    init: init,

    register() {
        return checkInitBeforeCall(Manager.registerPanel, [...arguments])
    },
    get() {
        return checkInitBeforeCall(Manager.getPanel, [...arguments])
    },
    show() {
        return checkInitBeforeCall(Manager.showPanel, [...arguments])
    },
    hide() {
        return checkInitBeforeCall(Manager.hidePanel, [...arguments])
    },
    toggle() {
        return checkInitBeforeCall(Manager.togglePanel, [...arguments])
    },
    hideAll() {
        return checkInitBeforeCall(Manager.hideAll, [...arguments])
    },

    resize() {
        return checkInitBeforeCall(Manager.resizePanel, [...arguments])
    },
    isOpen() {
        return checkInitBeforeCall(Manager.isOpen, [...arguments])
    },
    onHide() {
        return checkInitBeforeCall(Manager.onHide, [...arguments])
    },
    onScrollBarCompensation() {
        return checkInitBeforeCall(Manager.onScrollBarCompensation, [...arguments])
    }
}