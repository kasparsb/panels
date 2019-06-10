var Swipe = require('swipe');
var addCssClass = require('./addCssClass');
var hasCssClass = require('./hasCssClass');
var removeCssClass = require('./removeCssClass');
var addStyle = require('./addStyle');
var getWindowDimensions = require('./getWindowDimensions');
var getWindowScrollTop = require('./getWindowScrollTop');
var setWindowScrollTop = require('./setWindowScrollTop');
var calcPanelXYOffsetByProgress = require('./calcPanelXYOffsetByProgress');
var calcAlignXY = require('./calcAlignXY');
var domEvents = require('./domEvents');
var eventTarget = require('./eventTarget');
var panelGetProp = require('./panelGetProp');

var isPanelCloseButton = require('./isPanelCloseButton');
var getElementOuterDimensions = require('./getElementOuterDimensions');
var isjQuery = require('./isjQuery');

function panel(name, el, props) {

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
     * Pēdējais scrllTop kāds bija aizverot paneli
     * Scroll top ir tas, kur radīja pats panel content
     */
    this.lastScrollTop = 0;

    /**
     * @todo Apstrādāt gadījumu, kad ir padots jquery objekts
     * Jāvar darboties arī, ja ir padots native dom elements
     */
    if (isjQuery(el)) {
        this.el = el.get(0);
    }
    else {
        this.el = el;
    }
    

    /**
     * Animējamie elementi
     */
    this.animableElements = {
        'bg': this.el.querySelector('.modal-panel__bg'),
        'header': this.el.querySelector('.modal-panel__header'),
        'footer': this.el.querySelector('.modal-panel__footer'),
        'content': this.el.querySelector('.modal-panel__content'),
        /**
         * Šis tiek izmantots, lai noturētu content scrollTop, 
         * kad panelis tiek slēpts
         */
        'content-inner': this.el.querySelector('.modal-panel__content-inner')
    }

    // Ja ir footer, tad pieliekam klasi
    if (this.animableElements.footer) {
        addCssClass(this.el, 'modal-panel--footer');
    }
    else {
        removeCssClass(this.el, 'modal-panel--footer');
    }
    

    //this.swipe = new Swipe(this.el, {'direction': 'horizontal vertical'});

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
            else if (isPanelCloseButton(el)) {
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

    getProp: function(name, defaultValue, args) {
        return panelGetProp(this.props, this.props2, name, defaultValue, args);
    },

    setAnimableElementsStyle: function(cssProps, items) {

        if (typeof items == 'undefined') {
            items = ['bg', 'header', 'footer', 'content'];
        }

        for (var i = 0; i < items.length; i++) {
            if (this.animableElements[items[i]]) {
                addStyle(this.animableElements[items[i]], cssProps);
            }
        }
    },

    /**
     * Helper metode ar kuru notur content scrollTop
     * Tā kā panelim tiek uzlikts overflow hidden, tāpēc
     * scrolLTop pazūd un to vajag simulēt ar transform
     */
    preserveContentScrollTop: function(scrollTop) {
        if (!this.animableElements['content-inner']) {
            return;
        }
        
        addStyle(this.animableElements['content-inner'], {
            transform: scrollTop == 0 ? '' : 'translate(0, -'+scrollTop+'px)'
        });
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

    /**
     * Ja platums ir tāds pats kā viewport platums, tad ir 
     * jāliek 100% lai gadījumā, kad parādās vertical scroll bar,
     * tad neparādītos vertical sctrollbar un nevajadzētu rēķināt
     * scrollbar platumu un atņemt to no platuma
     */
    setWidth: function(width) {
        this.setAnimableElementsStyle({
            width: width >= this.windowDimensions.width ? '100%' : width+'px'
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
            left: this.align.x+'px',
            top: this.align.y+'px'
        }, [
            // Visam izņemot footer
            'bg', 'header', 'content'
        ]);
    },

    /**
     * Footer ir jāpozicionē pret panel apakšu
     * Šeit vajag zināt, kādi ir panel izmēri
     *
     * Vēl vajag zināt kāds ir footer augstums, bet 
     * kamēr panelis display:none footer augstums nav zināms
     */
    setFooterPosition: function(panelWidth, panelHeight) {
        if (!this.animableElements.footer) {
            return
        }

        // Footer vajag pozicionēt pret panel apakšu
        var dimensions = getElementOuterDimensions(this.animableElements.footer);

        this.setAnimableElementsStyle({
            left: this.align.x+'px',
            top: (this.align.y + panelHeight - dimensions.height)+'px'
        }, [
            // Tikai footer
            'footer'
        ]);
    },

    beforeShow: function() {
        this.isOpen = true;

        this.windowDimensions = getWindowDimensions();

        this.panelDimensions = {
            width: this.getProp('width', 320, [this.windowDimensions]),
            height: this.getProp('height', this.windowDimensions.height, [this.windowDimensions])
        };
        
        this.align = calcAlignXY(this.getProp('align', 'left top', [this.windowDimensions]), this.panelDimensions, this.windowDimensions);
        this.revealFrom = this.getProp('revealFrom', 'left', [this.windowDimensions]);
        this.revealType = this.getProp('revealType', 'none', [this.windowDimensions]);
        
        this.setPosition();
        this.setWidth(this.panelDimensions.width);
        this.setHeight(this.panelDimensions.height);

        // Atjaunojam scrollTop. Uzliekam content elementa Y offset
        if (this.getProp('restoreScrollTop', false)) {
            this.preserveContentScrollTop(this.lastScrollTop);
        }


        this.applyProgress(0);

        /**
         * @todo addCssClass rada bremzi un Stepper pirmais solis izpildās daudz reiz vēlāk
         * nekā, ja netiek izmantots addCssClass
         * Tā kā --visible uzstāda tikai display:block, tad lieka to caur style property
         */ 
        addCssClass(this.el, 'modal-panel--visible');
        //addStyle(this.el, {display: 'block'});
        
        
        /**
         * @todo Iespējams, ka vajag pārtiasīt, lai footer ir relatīvs pret content container
         * Pašlaik footer tiek poziconēts ar top, jo tas ie neatkarīgi no panel izmēriem
         */
        this.setFooterPosition(this.panelDimensions.width, this.panelDimensions.height);


        /**
         * iOS fix, ja neuzliek transform, tad skrollējot raustīsies fixed header
         */
        addStyle(this.el, {transform: 'translate3d(0,0,0)'});

        if (this.beforeShowCb) {
            this.beforeShowCb();
        }
    },

    afterShow: function() {
        addCssClass(this.el, 'modal-panel--ready');

        /**
         * Jānovāc transform, lai uz iOS 12 
         * scrollējot neraustītos fixed header
         */
        this.setAnimableElementsStyle({
            transform: ''
        })

        // Atjaunojam scroll top
        if (this.getProp('restoreScrollTop', false)) {
            setWindowScrollTop(this.lastScrollTop);
            this.preserveContentScrollTop(0);
        }

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

        /**
         * kad tiek noņemta klase modal-panel--ready
         * tad panelis kļūst overflow hidden
         * Šajā mirklī pazūt iepriekšējais scrollTop
         * jo tas ir uz visu dokumentu. Kad ir overflow hidden
         * tad skrolla vairs nav, jo nav overflowa
         *
         * Tāpēc šeit vajag nosimulēt scrollTop uzliekot uz 
         * modal-panel__content transform: translate(0,-currentScrollTop)
         */
        
        // Sitas ir jāpieglabā kā offset vērtība, jo applyProgress pārraksta transform
        // Pāpārsauc par lastScrollTop, tad šito varētu atjaunot atkārtoti atverto paneli
        // jātaisa, kā konfigurējams, ka tiešām grib lai atcerās lastScrollTop
        this.lastScrollTop = getWindowScrollTop();

        this.preserveContentScrollTop(this.lastScrollTop);

        removeCssClass(this.el, 'modal-panel--ready');
  
    },

    afterHide: function() {
        removeCssClass(this.el, 'modal-panel--visible');
        
        this.preserveContentScrollTop(0);

        // Jānovāc visi inline style deklarācijas no animableElements
        this.setAnimableElementsStyle({
            width: '',
            height: '',
            left: '',
            top: '',
            opacity: '',
            transform: ''
        })

        this.hideInProgress = false;

        this.isOpen = false;
    },

    resize: function() {
        this.windowDimensions = getWindowDimensions();

        this.panelDimensions = {
            width: this.getProp('width', 320, [this.windowDimensions]),
            height: this.getProp('height', this.windowDimensions.height, [this.windowDimensions])
        };
        
        this.align = calcAlignXY(this.getProp('align', 'left top', [this.windowDimensions]), this.panelDimensions, this.windowDimensions);
        this.revealFrom = this.getProp('revealFrom', 'left', [this.windowDimensions]);
        this.revealType = this.getProp('revealType', 'none', [this.windowDimensions]);
        
        this.setPosition();
        this.setWidth(this.panelDimensions.width);
        this.setHeight(this.panelDimensions.height);

        /**
         * @todo Iespējams, ka vajag pārtiasīt, lai footer ir relatīvs pret content container
         * Pašlaik footer tiek poziconēts ar top, jo tas ie neatkarīgi no panel izmēriem
         */
        this.setFooterPosition(this.panelDimensions.width, this.panelDimensions.height);
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