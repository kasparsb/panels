var Stepper = require('stepper');
var BodyScroll = require('./bodyScrollDisable');
var Overlay = require('./overlay');
var Panel = require('./panel');
var fireCallbacks = require('./fireCallbacks');
var propPushToArray = require('./propPushToArray');

// function getScrollbarWidth() {
//   return window.innerWidth - document.documentElement.clientWidth;
// }

var Step, OverlayStep, panels = {}, 
    needToShowOverlay = true, needToHideOverlay = true, 
    openPanelsCount = 0, openPanelsStack = []
    callbacks = {
        hide: {},
        show: {}
    };

/**
 * Bezier curve for sliding animations
 * Begging is fast, ending is slow
 */
var slidingAnimBezierCurve = {
    show: [0.075, 0.82, 0.165, 1],
    hide: [0.6, 0.04, 0.98, 0.335]
};

/**
 * Bezier curve for fading animations
 * Begging is fast, ending is slow
 */
var fadingAnimBezierCurve = {
    show: [0.55, 0.085, 0.68, 0.53],
    hide: [0.25, 0.46, 0.45, 0.94]
};


function init() {
    Step = new Stepper();
    OverlayStep = new Stepper();
}

function registerPanel(name, $el, props) {
    if (typeof panels[name] != 'undefined') {
        return
    }

    panels[name] = createPanel(name, $el, props);
}

function createPanel(name, $el, props) {
    var r = new Panel(name, $el, props);
    
    setPanelEvents(r);

    return r;
}

function getPanel(name) {
    return panels[name]
}

function setPanelEvents(Panel) {
    Panel.onClose(function(){
        handlePanelHide(Panel)
    })
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
        fireCallbacks(callbacks.hide[Panel.name], [function(){
            hidePanel(Panel, config)
        }])
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

    var animDurations = panel.getProp('animDurations');
    var showOverlay = panel.getProp('showOverlay', true);

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
                onStep: function(p){
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
            onStep: function(p){

                applyProgressCb(
                    panel, 
                    p, 
                    function(p){
                        panel.applyProgress(p)
                    },
                    BodyScroll.getEl()
                )

            }, 
            onDone: function(){
                panelAfterShow(panel)
            }
        })
    }
}

function hidePanel(panel, config) {
    panel.setOverrideProps(config);

    // Panel before hide event
    panel.getProp('onBeforeHide', function(){})();

    var animDurations = panel.getProp('animDurations');

    var done = function() {
        
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
                onStep: function(p){
                    if (Overlay.getProgress() >= (1-p)) {
                        Overlay.applyProgress(1-p)
                    }
                },
                onDone: done
            })
        }        
    }

    if (animDurations.panel <= 0) {
        panel.applyProgress(0);
        
        done();
    }
    else {
        var applyProgressCb = createPanelApplyProgressCallback(panel);

        Step.run({
            bezierCurve: getPanelRevealAnimationBezierCurve(panel).hide,
            duration: animDurations.panel,
            onStep: function(p){
                // Padodam panel, progress, default applyProgress metodi, kura ir obligāti
                // jāizsauc no custom applyProgress funkcijas
                applyProgressCb(
                    panel,
                    1-p,
                    function(p){
                        panel.applyProgress(p)
                    },
                    BodyScroll.getEl()
                )
            }, 
            onDone: done
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

        var r = [];
        for (var i = 0; i < openPanelsStack.length; i++) {
            r.push(openPanelsStack[i]);
        }

        for (var i = 0; i < r.length-1; i++) {
            hidePanelImediately(r[i]);
        }

        hidePanel(r[r.length-1]);
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

module.exports = {
    init: init,

    registerPanel: registerPanel,
    getPanel: getPanel,

    showPanel: function(panelName, config) {
        handlePanelShow(getPanel(panelName), config)
    },
    hidePanel: function(panelName, props) {
        handlePanelHide(getPanel(panelName), props)
    },
    resizePanel: function(panelName) {
        handlePanelResize(getPanel(panelName))
    },
    isOpen: function(panelName) {
        return getPanel(panelName).isOpen;
    },

    hideAll: hideAll,

    /**
     * @todo Šis ir jāpārsauc par onCloseClick
     * tas ir events, kad lietotājs ir izvēlējies aizvērt paneli
     * Šeit var pirms tam kaut ko izdarīt un tad izpildīts reālo
     * onCloseClick funkcionalitāti
     *
     * Bet varbūt vispār šitādu lietu nevajag, lai liek event uz paneli pa tiešo
     */
    onHide: function(panelName, cb) {
        callbacks.hide = propPushToArray(callbacks.hide, panelName, cb)
    }
}
