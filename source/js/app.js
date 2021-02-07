import BodyScroll from './bodyScrollDisable';
import Overlay from './overlay';
import Manager from './manager';

export default {
    init() {
        BodyScroll.init();
        Overlay.init();
        Manager.init();
    },

    register: Manager.registerPanel,
    get: Manager.getPanel,
    show: Manager.showPanel,
    hide: Manager.hidePanel,
    toggle: Manager.togglePanel,
    hideAll: Manager.hideAll,

    resize: Manager.resizePanel,
    isOpen: Manager.isOpen,

    onHide: Manager.onHide
}