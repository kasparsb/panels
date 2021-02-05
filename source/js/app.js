var BodyScroll = require('./bodyScrollDisable');
var Overlay = require('./overlay');
var Manager = require('./manager');

console.log('debug');

function init() {
    BodyScroll.init();
    Overlay.init();
    Manager.init();
}

module.exports = {
    init: init,

    register: Manager.registerPanel,
    get: Manager.getPanel,
    show: Manager.showPanel,
    resize: Manager.resizePanel,
    hide: Manager.hidePanel,
    isOpen: Manager.isOpen,

    onHide: Manager.onHide
}