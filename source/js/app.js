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
    resize: Manager.resizePanel,
    hide: Manager.hidePanel,
    hideAll: Manager.hideAll,
    isOpen: Manager.isOpen,

    onHide: Manager.onHide
}