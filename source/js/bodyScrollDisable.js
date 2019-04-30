var getWindowScrollTop = require('./getWindowScrollTop');
var setWindowScrollTop = require('./setWindowScrollTop');
var addCssClass = require('./addCssClass');
var removeCssClass = require('./removeCssClass');
var addStyle = require('./addStyle');
var getStyle = require('./getStyle');

var app, appContainer, scrollTop, prevAppWPosition = '';

function init() {

    /**
     * @todo Uztaisīt, lai app un app-w ir konfigurējami
     */

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

    /**
     * Šajā mirklī appContainer obligāti jābūit position fixed
     * Jānolasa kāda ir tekošā position un jāpieglabā
     * Iespējams, ka pašlaik tam ir inline uzlikts cits position
     * Kad būs enabled position jāuzliek tāds pats kā pirms disabled
     *
     * Nolasam tikai vērtību no elementam pa tiešo uz style uzlikto position
     * jo jaunais position tiks uzlikts uz elementu pa tiešo
     */

    // Read and store current positon
    prevAppWPosition = getStyle(appContainer, 'position');
    // Add position fixed
    addStyle(appContainer, {
        position: 'fixed'
    })
    addCssClass(appContainer, 'app-w--disabled');


    addStyle(app, {
        transform: 'translate(0,-'+scrollTop+'px)'
    })
}

function enable() {
    addStyle(appContainer, {
        position: prevAppWPosition
    })
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
    enable: enable,
    getEl: function() {
        return {
            setStyle: function(style){
                addStyle(appContainer, style)
            },
            el: appContainer
        }
    },
    setZIndex: function(i) {
        addStyle(appContainer, {
            zIndex: i
        })
    }
}