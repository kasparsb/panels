import getWindowScrollTop from 'dom-helpers/src/getWindowScrollTop';
import setWindowScrollTop from 'dom-helpers/src/setWindowScrollTop';
import addClass from 'dom-helpers/src/addClass';
import removeClass from 'dom-helpers/src/removeClass';
import addStyle from 'dom-helpers/src/addStyle';
import getStyle from 'dom-helpers/src/getStyle';
import q from 'dom-helpers/src/q';

var app, appContainer, scrollTop, prevAppWPosition = '';

function init() {

    /**
     * @todo Uztaisīt, lai app un app-w ir konfigurējami
     */

    app = q('.app');
    appContainer = q('.app-w');
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
    addClass(appContainer, 'app-w--disabled');


    addStyle(app, {
        transform: 'translate(0,-'+scrollTop+'px)'
    })
}

function enable() {
    addStyle(appContainer, {
        position: prevAppWPosition
    })
    removeClass(appContainer, 'app-w--disabled');


    addStyle(app, {
        transform: ''
    })

    // Atjaunojam scroll top
    setWindowScrollTop(scrollTop);
}

export default {
    init,
    disable,
    enable,
    getEl() {
        return {
            setStyle(style){
                addStyle(appContainer, style)
            },
            el: appContainer
        }
    },
    setZIndex(i) {
        addStyle(appContainer, {
            zIndex: i
        })
    }
}