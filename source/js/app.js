var BodyScroll = require('./bodyScrollDisable');
var Overlay = require('./overlay');
var Manager = require('./manager');

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
    hide: Manager.hidePanel,

    onHide: Manager.onHide
}