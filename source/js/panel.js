var Swipe = require('swipe');
var addCssClass = require('./addCssClass');
var hasCssClass = require('./hasCssClass');
var removeCssClass = require('./removeCssClass');
var addStyle = require('./addStyle');
var getWindowDimensions = require('./getWindowDimensions');
var calcPanelXYOffsetByProgress = require('./calcPanelXYOffsetByProgress');
var calcAlignXY = require('./calcAlignXY');
var domEvents = require('./domEvents');
var eventTarget = require('./eventTarget');
var panelGetProp = require('./panelGetProp');
var solveValue = require('./solveValue');

function panel(name, $el, props) {

    this.isOpen = false;

    this.closeCb = undefined;
    this.beforeShowCb = undefined;

    this.hideInProgress = false;

    this.name = name;
    this.props = props;
    /**
     * Override props. 
     * Šos var uzstādīt veicot show vai hide, tad var padots
     * savādākus props.
     * Kad nolasīs props, tad kā prioritāte būs props2
     */
    this.props2 = undefined;

    this.$el = $el;

    /**
     * Paneļa platums. Šis tiek ņemts no props.width
     * Ar šo mainīgo width tiek iekešots un tiek ielasīts
     * tikai vienu reizi beforeShow eventā
     */
    this.panelDimensions = { width: 0, height: 0 }
    this.windowDimensions = { width: 0, height: 0 }

    // Šie tiek definēti beforeShow
    this.align;
    this.revealFrom;
    this.revealType;

    /**
     * Animējamie elementi
     */
    this.animableElements = {
        'bg': $el.find('.modal-panel__bg').get(0),
        'header': $el.find('.modal-panel__header').get(0),
        'footer': $el.find('.modal-panel__footer').get(0),
        'content': $el.find('.modal-panel__content').get(0)
    }

    //this.swipe = new Swipe(this.el, {'direction': 'horizontal vertical'});

    /**
     * @todo Apstrādāt gadījumu, kad ir padots jquery objekts
     * Jāvar darboties arī, ja ir padots native dom elements
     */
    this.el = this.$el.get(0);

    this.setEvents();
}

panel.prototype = {
    setEvents: function() {
        var mthis = this;

        domEvents.addEvent(this.el, 'click', function(ev){
            var el = eventTarget(ev);
            var closePanel = false;
            
            // Pats panelis, reaģējam uz ārpus paneļa body click
            if (el == mthis.el) {
                if (mthis.getProp('hideOnOutsideClick', false)) {
                    closePanel = true;
                }
            }
            else if (hasCssClass(el, 'modal-panel__close')) {
                /**
                 * Reaģējam uz panelī definēto close pogu
                 * closeCb nāk no panelsManager, kura šādā 
                 * veidā pateiksim, ka ir jāaizveras
                 */
                closePanel = true;
            }

            if (closePanel) {
                ev.preventDefault();

                if (mthis.closeCb) {
                    mthis.closeCb();
                }
            }
        })
    },
    
    /**
     * @todo Jāpārdomā vai šo tiešām vajag, jo šis pārtrauc onClick eventu
     */
    // handleTouchStart: function(ev) {
    //     /**
    //      * Mobile safari:
    //      * Ja panel ir mazāks par windowHeight, tad jānovērš overscroll
    //      * Reaģējam tikai uz this.el
    //      */
    //     if (this.panelDimensions.height < this.windowDimensions.height) {
    //         if (domEvents.eventTarget(ev) == this.el) {
    //             domEvents.preventEvent(ev);
    //         }
    //     }
    // },

    setOverrideProps: function(props) {
        this.props2 = props;
    },

    getProp: function(name, defaultValue) {
        return panelGetProp(this.props, this.props2, name, defaultValue);
    },

    /**
     * Get width ir konfigurējams no props
     */
    getWidth: function(viewportDimensions) {
        return solveValue(this.getProp('width', 320), [viewportDimensions]);
    },

    /**
     * Get width ir konfigurējams no props
     */
    getHeight: function(viewportDimensions) {
        return solveValue(this.getProp('height', viewportDimensions.height), [viewportDimensions]);
    },

    setAnimableElementsStyle: function(cssProps) {
        for (var n in this.animableElements) {
            if (!this.animableElements.hasOwnProperty(n)) {
                continue;
            }
            
            if (!this.animableElements[n]) {
                continue;
            }
            
            addStyle(this.animableElements[n], cssProps);
        }
    },

    applyProgress: function(progress) {
        if (this.revealType == 'slide') {
            this.setXYOffset(
                calcPanelXYOffsetByProgress(
                    this.align, 
                    this.revealFrom,
                    this.panelDimensions,
                    this.windowDimensions,
                    progress
                )
            )
        }
        else if (this.revealType == 'fade') {
            this.setOpacity(1*progress)
        }
    },

    /**
     * Priekš slide animācijas
     */
    setXYOffset: function(offset) {
        this.setAnimableElementsStyle({
            transform: 'translate3d('+offset.x+'px,'+offset.y+'px,0)'
        })
    },

    setOpacity: function(opacity) {
        this.setAnimableElementsStyle({
            opacity: opacity
        })
    },

    setWidth: function(width) {
        this.setAnimableElementsStyle({
            width: width+'px'
        });
    },

    setHeight: function(height) {
        /**
         * Mobile safari: jāuzliek windowHeight, lai neparādītos bottom pogas
         * Visi elementi ir fixed, šis būs tas, kas saglabās windowHeight
         * @todo Te vēl vajadzētu uzlikt touchstart eventu, lai varētu atcelt
         * overscroll
         */
        addStyle(this.el, {height: this.windowDimensions.height+'px'})

        /**
         * Special case, kad height ir tāds pats kā viewportHeight
         * šajā gadījumā vajag lai background ir lielāks par viewport, 
         * lai scrollējot uz mobile safari/chrome nebūtu raustišanās,
         * kad parādās un pazūd bottom menu (kas izraisa ekrāna paaugstināšanos)
         */
        if (height >= this.windowDimensions.height) {
            addStyle(this.animableElements.bg, {height: '120%'})
        }
        else {
            addStyle(this.animableElements.bg, {height: height+'px'})
        }
    },

    setZIndex: function(i) {
        addStyle(this.el, {
            zIndex: i
        })
    },

    setPosition: function() {
        this.setAnimableElementsStyle({
            left: this.align.x+'px'

            /**
             * @todo Pašlaik ar vertical align nestrādājam, tikai horizontal
             */
            //,top: this.align.y+'px'
        });
    },

    beforeShow: function() {
        this.isOpen = true;

        this.windowDimensions = getWindowDimensions();
        this.panelDimensions = {
            width: this.getWidth(this.windowDimensions),
            height: this.getHeight(this.windowDimensions)
        };
        
        this.align = calcAlignXY(this.getProp('align', 'left top'), this.panelDimensions, this.windowDimensions);
        this.revealFrom = this.getProp('revealFrom', 'left');
        this.revealType = this.getProp('revealType', 'none');
        
        this.setPosition();
        this.setWidth(this.panelDimensions.width);
        this.setHeight(this.panelDimensions.height);
        this.applyProgress(0);

        addCssClass(this.el, 'modal-panel--visible');

        /**
         * iOS fix, ja neuzliek transform, tad skrollējot raustīsies fixed header
         */
        addStyle(this.el, {transform: 'translate3d(0,0,0)'});

        if (this.beforeShowCb) {
            this.beforeShowCb();
        }
    },

    showPanelDone: function() {
        addCssClass(this.el, 'modal-panel--ready');

        /**
         * Jānovāc transform, lai uz iOS 12 
         * scrollējot neraustītos fixed header
         */
        this.setAnimableElementsStyle({
            transform: ''
        })


        /**
         * iOS fix, ja neuzliek transform, tad skrollējot raustīsies fixed header
         * Kad animācija beigusies, tad ņemam nost, lai nebojā fixed header palikšanu
         * uz vietas, kad notiek scrollēšana
         * Ja parent elementam ir uzlikts transform, tad child position:fixed elementi
         * ir relatīvi pret parent nevis document
         */
        addStyle(this.el, {transform: ''});
    },

    beforeHide: function() {
        this.hideInProgress = true;

        removeCssClass(this.el, 'modal-panel--ready');
    },

    afterHide: function() {
        removeCssClass(this.el, 'modal-panel--visible');

        this.hideInProgress = false;

        this.isOpen = false;
    },

    disable: function() {
        addCssClass(this.el, 'modal-panel--disabled');
    },

    enable: function() {
        removeCssClass(this.el, 'modal-panel--disabled');
    },

    onClose: function(cb) {
        this.closeCb = cb
    },

    onBeforeShow: function(cb) {
        this.beforeShowCb = cb;
    }
}

module.exports = panel