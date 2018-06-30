var BodyScroll = require('./bodyScrollDisable');
var Overlay = require('./overlay');
var Manager = require('./manager');

BodyScroll.init();
Overlay.init();
Manager.init();

module.exports = {
    register: Manager.registerPanel,
    get: Manager.getPanel,
    show: Manager.showPanel,
    hide: Manager.hidePanel
}