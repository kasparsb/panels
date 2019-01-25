var Stepper = require('stepper');
var BodyScroll = require('./bodyScrollDisable');
var Overlay = require('./overlay');
var Panel = require('./panel');
var fireCallbacks = require('./fireCallbacks');
var propPushToArray = require('./propPushToArray');
var getData = require('./getData');
var validateAnimDurations = require('./validateAnimDurations');
var validateZIndex = require('./validateZIndex');


var Step, OverlayStep, panels = {}, 
    needToShowOverlay = true, needToHideOverlay = true, 
    openPanelsCount = 0, openPanelsStack = []
    callbacks = {
        hide: {},
        show: {}
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

    Panel.onApplyProgress(function(){
        
    })
}

function handlePanelShow(Panel, config) {
    showPanel(Panel, config);
}

/**
 * Panel hide event
 */
function handlePanelHide(Panel, config) {

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
}

function showPanel(panel, config) {

    panel.setOverrideProps(config);

    var zIndex = validateZIndex(panel.getProp('zIndex'));

    
    BodyScroll.setZIndex(zIndex.bodyFrame);
    Overlay.setZIndex(zIndex.overlay);
    panel.setZIndex(zIndex.panel);



    var animDurations = validateAnimDurations(panel.getProp('animDurations'));
    var showOverlay = panel.getProp('showOverlay', true);

    // Iepriekšējo paneli, ja tāds ir, disable
    if (openPanelsCount > 0) {
        openPanelsStack[openPanelsStack.length-1].disable();
    }

    panelBeforeShow(panel);

    if (showOverlay && needToShowOverlay) {

        if (animDurations.overlay <= 0) {
            Overlay.applyProgress(1)
        }
        else {
            OverlayStep.run(animDurations.overlay, [0.455, 0.03, 0.515, 0.955],
                function(p){
                    Overlay.applyProgress(p)
                }
            )    
        }
        
    }

    if (animDurations.panel <= 0) {
        panel.applyProgress(1);
        if (panel.showPanelDone) {
            panel.showPanelDone()
        }

        panel.setOverrideProps(null);
    }
    else {

        var applyProgressCb = createPanelApplyProgressCallback(panel);

        setTimeout(function(){
            Step.run(animDurations.panel, [0.455, 0.03, 0.515, 0.955],
                function(p){

                    applyProgressCb(
                        panel, 
                        p, 
                        function(p){
                            panel.applyProgress(p)
                        },
                        BodyScroll.getEl()
                    )

                }, 
                function(){
                    if (panel.showPanelDone) {
                        panel.showPanelDone()
                    }

                    panel.setOverrideProps(null);
                }
            )
        }, 140)
    }
    
}

function hidePanel(panel, config) {
    panel.setOverrideProps(config);
    var animDurations = validateAnimDurations(panel.getProp('animDurations'));

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
            OverlayStep.run(animDurations.overlay, [0.455, 0.03, 0.515, 0.955],
                function(p){
                    if (Overlay.getProgress() >= (1-p)) {
                        Overlay.applyProgress(1-p)
                    }
                },
                done
            )
        }        
    }

    if (animDurations.panel <= 0) {
        panel.applyProgress(0);
        
        done();
    }
    else {
        var applyProgressCb = createPanelApplyProgressCallback(panel);

        Step.run(animDurations.panel, [0.455, 0.03, 0.515, 0.955], 
            function(p){
                
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
            done
        )    
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

    hideAll: hideAll,

    onHide: function(panelName, cb) {
        callbacks.hide = propPushToArray(callbacks.hide, panelName, cb)
    }
}
