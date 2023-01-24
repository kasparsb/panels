import re from 'dom-helpers/src/re';
import on from 'dom-helpers/src/event/on';
import getWindowDimensions from 'dom-helpers/src/getWindowDimensions';
import addStyle from 'dom-helpers/src/addStyle';
import append from 'dom-helpers/src/append';
import Stepper from 'stepper';
import BodyScroll from './bodyScrollDisable';
import Overlay from './overlay';
import Panel from './panel';
import fireCallbacks from './fireCallbacks';
import propPushToArray from './propPushToArray';

// function getScrollbarWidth() {
//   return window.innerWidth - document.documentElement.clientWidth;
// }

let Step, OverlayStep, panels = {},
    needToShowOverlay = true, needToHideOverlay = true,
    openPanelsCount = 0, openPanelsStack = [],
    windowDimensions = {}, scrollHelper,
    callbacks = {
        hide: {},
        show: {}
    };

/**
 * Bezier curve for sliding animations
 * Begging is fast, ending is slow
 */
let slidingAnimBezierCurve = {
    show: [0.075, 0.82, 0.165, 1],
    hide: [0.075, 0.82, 0.165, 1]
};

/**
 * Bezier curve for fading animations
 * Begging is fast, ending is slow
 */
let fadingAnimBezierCurve = {
    show: [0.55, 0.085, 0.68, 0.53],
    hide: [0.25, 0.46, 0.45, 0.94]
};


function init() {
    Step = new Stepper();
    OverlayStep = new Stepper();

    // Neskrolējama cover panēl skroll palīgs, lai varēt ieskrolēt adrese joslu
    scrollHelper = createScrollHelper();

    windowDimensions = getWindowDimensions();

    // Set window resize handler
    let st = 0;
    on(window, 'resize', function(){
        clearTimeout(st);
        st = setTimeout(handleResizeAll, 5);
    })
}

function handleResizeAll() {
    windowDimensions = getWindowDimensions();

    forEachPanel(panel => panel.isOpen ? panel.resize() : '')
}

function createScrollHelper() {
    let r = document.createElement('div');
    addStyle(r, {
        top: 0,
        left: 0,
        width: '1px',
        height: 0,
        position: 'absolute',
        zIndex: -1
    });
    append('body', r);
    return r;
}

function forEachPanel(cb) {
    for (let name in panels) {
        if (panels.hasOwnProperty(name)) {
            cb(panels[name], name);
        }
    }
}

function registerPanel(name, el, props) {
    el = re(el);

    if (typeof panels[name] != 'undefined') {
        return
    }

    panels[name] = createPanel(name, el, props);
}

function createPanel(name, el, props) {
    let r = new Panel(name, el, props);

    /**
     * Window dimensions nolasīs tika manager un vienu reizi pie window resize
     */
    r.getWindowDimensions = function(){
        return windowDimensions
    }

    r.setScrollHelperHeight = function(height) {
        addStyle(scrollHelper, {height: height+'px'});
    }

    setPanelEvents(r);

    return r;
}

function getPanel(name) {
    return panels[name]
}

function setPanelEvents(Panel) {
    Panel.onClose(() => handlePanelHide(Panel))
}

function setZIndex(zIndex, panel) {
    BodyScroll.setZIndex(zIndex.bodyFrame);
    Overlay.setZIndex(zIndex.overlay);
    panel.setZIndex(zIndex.panel);
}

function handlePanelShow(Panel, config) {
    if (Panel.isOpen) {
        return;
    }

    showPanel(Panel, config);
}

/**
 * Panel hide event
 */
function handlePanelHide(Panel, config) {
    if (!Panel.isOpen) {
        return;
    }

    if (Panel.hideInProgress) {
        return;
    }

    // Ja panelim ir custom close callback, tad tam padodam iekšejo close metodi
    if (typeof callbacks.hide[Panel.name] != 'undefined') {
        fireCallbacks(callbacks.hide[Panel.name], [ () => hidePanel(Panel, config) ])
    }
    else {
        hidePanel(Panel, config)
    }
}

function handlePanelResize(Panel) {
    if (!Panel.isOpen) {
        return;
    }

    Panel.resize();
}

function panelBeforeShow(panel) {
    openPanelsCount++;
    openPanelsStack.push(panel);

    //if (openPanelsCount > 0)

    needToShowOverlay = !Overlay.isVisible();

    if (needToShowOverlay) {
        Overlay.beforeShow();
        BodyScroll.disable();
    }

    panel.beforeShow();
}

function panelAfterShow(panel) {
    panel.afterShow()

    // Panel show event
    panel.getProp('onShow', function(){})()

    panel.setOverrideProps(null);
}

function panelBeforeHide(panel) {

    panel.beforeHide();

    needToHideOverlay = Overlay.isVisible()

    if (openPanelsCount > 1) {
        needToHideOverlay = false;
    }

    if (needToHideOverlay) {
        Overlay.beforeHide();
    }
}

function panelAfterHide(panel) {
    openPanelsCount--;
    openPanelsStack.pop();

    if (openPanelsCount > 0) {
        openPanelsStack[openPanelsStack.length-1].enable();
    }

    //if (openPanelsCount <= 0)

    if (needToHideOverlay) {
        Overlay.afterHide();
        BodyScroll.enable();
    }

    panel.afterHide();

    // Panel hide event
    panel.getProp('onHide', function(){})()
}

function showPanel(panel, config) {
    panel.setOverrideProps(config);

    // Izpildām user uzstādīto before show eventu
    panel.getProp('onBeforeShow', function(){})();

    let animDurations = panel.getProp('animDurations');
    let showOverlay = panel.getProp('showOverlay', true);

    // Ja nav uzstādīts revealType, tad novācam animationDuration
    if (!panel.getProp('revealType')) {
        animDurations.overlay = 0;
        animDurations.panel = 0;
    }

    // Iepriekšējo paneli, ja tāds ir, disable
    if (openPanelsCount > 0) {
        openPanelsStack[openPanelsStack.length-1].disable();
    }

    setZIndex(panel.getProp('zIndex'), panel);

    panelBeforeShow(panel);

    if (showOverlay && needToShowOverlay) {

        if (animDurations.overlay <= 0) {
            Overlay.applyProgress(1)
        }
        else {
            OverlayStep.run({
                bezierCurve: panel.getProp('overlayAnimBezierCurve', fadingAnimBezierCurve).show,
                duration: animDurations.overlay,
                onStep(p) {
                    Overlay.applyProgress(p)
                }
            })
        }

    }

    if (animDurations.panel <= 0) {
        panel.applyProgress(1);

        panelAfterShow(panel);
    }
    else {

        var applyProgressCb = createPanelApplyProgressCallback(panel);

        Step.run({
            bezierCurve: getPanelRevealAnimationBezierCurve(panel).show,
            duration: animDurations.panel,
            onStep(p){
                applyProgressCb(
                    panel,
                    p,
                    p => panel.applyProgress(p),
                    BodyScroll.getEl()
                )

            },
            onDone(){
                panelAfterShow(panel)
            }
        })
    }
}

function hidePanel(panel, config) {
    panel.setOverrideProps(config);

    // Panel before hide event
    panel.getProp('onBeforeHide', function(){})();

    let animDurations = panel.getProp('animDurations');

    // Ja nav uzstādīts revealType, tad novācam animationDuration
    if (!panel.getProp('revealType')) {
        animDurations.overlay = 0;
        animDurations.panel = 0;
    }

    let onDone = function() {

        if (OverlayStep.isRunning() || Step.isRunning()) {
            return;
        }

        panelAfterHide(panel);

        // Notīrām override props
        panel.setOverrideProps(null);
    }

    panelBeforeHide(panel);

    if (needToHideOverlay) {
        if (animDurations.overlay <= 0) {
            Overlay.applyProgress(0);
        }
        else {
            OverlayStep.run({
                bezierCurve: panel.getProp('overlayAnimBezierCurve', fadingAnimBezierCurve).hide,
                duration: animDurations.overlay,
                onStep(p) {
                    if (Overlay.getProgress() >= (1-p)) {
                        Overlay.applyProgress(1-p)
                    }
                },
                onDone
            })
        }
    }

    if (animDurations.panel <= 0) {
        panel.applyProgress(0);

        onDone();
    }
    else {
        let applyProgressCb = createPanelApplyProgressCallback(panel);

        Step.run({
            bezierCurve: getPanelRevealAnimationBezierCurve(panel).hide,
            duration: animDurations.panel,
            onStep(p){
                // Padodam panel, progress, default applyProgress metodi, kura ir obligāti
                // jāizsauc no custom applyProgress funkcijas
                applyProgressCb(
                    panel,
                    1-p,
                    p => panel.applyProgress(p),
                    BodyScroll.getEl()
                )
            },
            onDone
        })
    }

}

function hidePanelImediately(panel) {
    hidePanel(panel, {
        overlay: 0,
        panel: 0
    })
}

function hideAll(){
    if (openPanelsCount > 0) {

        // All panels except last one hideImmediatelu without animations etc
        openPanelsStack
            .slice(0, openPanelsCount-1)
            .forEach(panel => hidePanelImediately(panel))

        // Last one close normaly with animations etc
        hidePanel(openPanelsStack[openPanelsCount-1]);
    }
}

/**
 * Šī ir funkcija, kura vienkārši izpildīs padoto defaultApplyProgress
 * un nekādas papildus darbības neveiks
 * Šī ir kā signature funkciju, kura ir jāizmanto, ja vēlas overraidot apply progress
 * šeit ir redzami visi parametri, kuri tiks padoti funkcijai
 */
function defaultPanelApplyProgressCallback(panel, p, defaultApplyProgress, bodyFrame) {
    defaultApplyProgress(p);
}

/**
 * Meklējam custom applyProgress paneļa props iestatījumos
 * Ja nav, tad izmantosim defaultApplyProgress funkciju
 */
function createPanelApplyProgressCallback(panel) {
    return panel.getProp('applyProgress', defaultPanelApplyProgressCallback);
}

function getPanelRevealAnimationBezierCurve(panel) {
    switch (panel.getProp('revealType')) {
        case 'fade':
            return panel.getProp('panelAnimBezierCurve', fadingAnimBezierCurve);
        default:
            return panel.getProp('panelAnimBezierCurve', slidingAnimBezierCurve);
    }
}

export default {
    init,

    registerPanel,
    getPanel,
    hideAll,

    showPanel(panelName, config) {
        handlePanelShow(getPanel(panelName), config)
    },
    hidePanel(panelName, props) {
        handlePanelHide(getPanel(panelName), props)
    },
    togglePanel(panelName, props) {
        let panel = getPanel(panelName);
        panel.isOpen ? handlePanelHide(panel) : handlePanelShow(panel)
    },
    resizePanel(panelName) {
        if (panelName) {
            handlePanelResize(getPanel(panelName));
        }
        else {
            handleResizeAll();
        }
    },
    isOpen(panelName) {
        return getPanel(panelName).isOpen;
    },


    /**
     * @todo Šis ir jāpārsauc par onCloseClick
     * tas ir events, kad lietotājs ir izvēlējies aizvērt paneli
     * Šeit var pirms tam kaut ko izdarīt un tad izpildīts reālo
     * onCloseClick funkcionalitāti
     *
     * Bet varbūt vispār šitādu lietu nevajag, lai liek event uz paneli pa tiešo
     */
    onHide(panelName, cb) {
        callbacks.hide = propPushToArray(callbacks.hide, panelName, cb)
    }
}
