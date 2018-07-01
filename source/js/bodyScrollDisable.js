var getWindowScrollTop = require('./getWindowScrollTop');
var setWindowScrollTop = require('./setWindowScrollTop');
var addCssClass = require('./addCssClass');
var removeCssClass = require('./removeCssClass');
var addStyle = require('./addStyle');

var app, appContainer, scrollTop;

function init() {
    app = getEl('app');
    appContainer = getEl('app-w');
}

function getEl(className) {
    var r = document.getElementsByClassName(className);
    return r.length > 0 ? r[0] : null;
}

function disable() {
    // Piefiksējam scroll top
    scrollTop = getWindowScrollTop();

    addCssClass(appContainer, 'app-w--disabled');
    addStyle(app, {
        transform: 'translate(0,-'+scrollTop+'px)'
    })
}

function enable() {
    removeCssClass(appContainer, 'app-w--disabled');
    addStyle(app, {
        transform: ''
    })

    // Atjaunojam scroll top
    setWindowScrollTop(scrollTop);
}

module.exports = {
    init: init,
    disable: disable,
    enable: enable
}