var Stepper = require('stepper');
var BodyScroll = require('./bodyScrollDisable');
var Overlay = require('./overlay');
var Panel = require('./panel');

var Step, OverlayStep, panels = {}, 
    needToShowOverlay = true, needToHideOverlay = true, 
    openPanelsCount = 0, openPanelsStack = [];

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
        hidePanel(Panel)
    })
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

function showPanel(panel, withoutAnimation, animDurations) {

    if (typeof panel != 'object') {
        panel = getPanel(panel);
    }

    if (typeof withoutAnimation == 'undefined') {
        withoutAnimation = false;
    }

    if (typeof animDurations == 'undefined') {
        animDurations = {
            overlay: 500,
            panel: 500
        }
    }

    // Iepriekšējo paneli, ja tāds ir, disable
    if (openPanelsCount > 0) {
        openPanelsStack[openPanelsStack.length-1].disable();
    }

    panelBeforeShow(panel);

    if (needToShowOverlay) {

        if (withoutAnimation) {
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

    if (withoutAnimation) {
        panel.applyProgress(1);
        if (panel.showPanelDone) {
            panel.showPanelDone()
        }
    }
    else {
        setTimeout(function(){
            Step.run(animDurations.panel, [0.455, 0.03, 0.515, 0.955],
                function(p){
                    panel.applyProgress(p)
                }, 
                function(){
                    if (panel.showPanelDone) {
                        panel.showPanelDone()
                    }
                }
            )
        }, 140)
    }
    
}

function hidePanel(panel, withoutAnimation, animDurations) {
    if (typeof panel != 'object') {
        panel = getPanel(panel);
    }

    if (typeof withoutAnimation == 'undefined') {
        withoutAnimation = false;
    }

    if (typeof animDurations == 'undefined') {
        animDurations = {
            overlay: 500,
            panel: 500
        }
    }

    panelBeforeHide(panel);

    if (needToHideOverlay) {
        if (withoutAnimation) {
            Overlay.applyProgress(0)
        }
        else {
            OverlayStep.run(animDurations.overlay, [0.455, 0.03, 0.515, 0.955],
                function(p){
                    Overlay.applyProgress(1-p)
                }
            )
        }
        
    }

    if (withoutAnimation) {
        panel.applyProgress(0);
        panelAfterHide(panel);
    }
    else {
        Step.run(animDurations.panel, [0.455, 0.03, 0.515, 0.955], 
            function(p){
                panel.applyProgress(1-p)
            }, 
            function(){
                panelAfterHide(panel);
            }
        )    
    }
    
}

function hidePanelImediately(panel) {
    hidePanel(panel, true)
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

module.exports = {
    init: init,

    registerPanel: registerPanel,
    getPanel: getPanel,
    showPanel: showPanel,
    hidePanel: hidePanel,

    hideAll: hideAll
}
