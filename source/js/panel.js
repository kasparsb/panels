var addCssClass = require('./addCssClass');
var removeCssClass = require('./removeCssClass');
var addStyle = require('./addStyle');
var getWindowDimensions = require('./getWindowDimensions');
var calcPanelXYOffsetByProgress = require('./calcPanelXYOffsetByProgress');

function panel(name, $el, props) {

    this.closeCb = undefined;
    this.beforeShowCb = undefined;

    this.name = name;
    this.props = props;

    this.$el = $el;
    this.el = this.prepareEl($el.get(0));

    /**
     * Paneļa platums. Šis tiek ņemts no props.width
     * Ar šo mainīgo width tiek iekešots un tiek ielasīts
     * tikai vienu reizi beforeShow eventā
     */
    this.panelDimensions = {
        width: 0,
        height: 0
    }
    this.panelAlign = 'right';
    this.revealDirection = 'right';
    this.windowDimensions = {};

    /**
     * Animējamie elementi
     */
    this.animableElements = {
        'bg': $el.find('.modal-panel__bg').get(0),
        'header': $el.find('.modal-panel__header').get(0),
        'footer': $el.find('.modal-panel__footer').get(0),
        'content': $el.find('.modal-panel__content').get(0)
    }

    this.setEvents();

    // Overraidojama applyProgress metode
    this._applyProgress = this.getProp('applyProgress', this.defaultApplyProgress)
}

panel.prototype = {
    setEvents: function() {
        var mthis = this;

        /**
         * Reaģējam uz panelī definēto close pogu
         * closeCb nāk no panelsManager, kura šādā 
         * veidā pateiksim, ka ir jāaizveras
         */
        this.$el.on('click', '.modal-panel__close', function(ev){
            ev.preventDefault();

            
            if (mthis.closeCb) {
                mthis.closeCb();    
            }
        })
    },

    prepareEl: function(el) {

        // Default align: right
        addCssClass(el, 'modal-panel--'+this.getAlign())

        return el;
    },

    getProp: function(name, defaultValue) {
        if (typeof this.props[name] == 'undefined') {
            return defaultValue
        }

        return this.props[name]
    },

    /**
     * Paneļa novietojums
     */
    getAlign: function() {
        return this.getProp('align', 'right');
    },

    /**
     * Virziens, no kura panelis tiek iebīdīts ekrānā
     */
    getRevealDirection: function() {
        return this.getProp('revealDirection', this.getAlign());
    },

    /**
     * Get width ir konfigurējams no props
     */
    getWidth: function(viewportDimensions) {
        var width = this.getProp('width', 320);

        switch (typeof width) {
            // Width var nodefinēt kā funkciju
            case 'function':
                return width(viewportDimensions);
            default:
                return width;
        }
    },

    /**
     * Get width ir konfigurējams no props
     */
    getHeight: function(viewportDimensions) {
        var height = this.getProp('height', viewportDimensions.height);

        switch (typeof height) {
            // Width var nodefinēt kā funkciju
            case 'function':
                return height(viewportDimensions);
            default:
                return height;
        }
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

    /**
     * Interfeiss priekš īstās applyProgress metodes
     * _applyProgress tiek nodefinēts konstruktorā
     */
    applyProgress: function(progress) {
        this._applyProgress(this, progress)
    },

    /**
     * applyProgress ir iespēja overraidot. 
     * Šī ir default applyProgress funkcionalitāte
     * @param object Panel instance. Šajā gadījumā tas ir this
     * bet, lai būtu vieglāk saprast kā overraidot, tad šeit
     * tiek padots panel, tā pat kā custom applyProgress gadījumā
     * @param number Progress: 0 - sākuma stāvoklis (aizvērts), 1 - pilnībā atvērts
     */
    defaultApplyProgress: function(panel, progress) {
        panel.setXYOffset(
            calcPanelXYOffsetByProgress(
                panel.panelAlign, 
                panel.revealDirection,
                panel.panelDimensions,
                panel.windowDimensions,
                progress
            )
        );
    },

    setXYOffset: function(offset) {
        this.setAnimableElementsStyle({
            transform: 'translate3d('+offset.x+'px,'+offset.y+'px,0)'
        })
    },

    setWidth: function(width) {
        this.setAnimableElementsStyle({
            width: width+'px'
        });
    },

    setHeight: function(height) {
        addStyle(this.el, {height: height+'px'})

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

    beforeShow: function() {
        this.windowDimensions = getWindowDimensions();
        this.panelDimensions = {
            width: this.getWidth(this.windowDimensions),
            height: this.getHeight(this.windowDimensions)
        };
        this.panelAlign = this.getAlign();
        this.revealDirection = this.getRevealDirection();
        

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
        removeCssClass(this.el, 'modal-panel--ready');
    },

    afterHide: function() {
        removeCssClass(this.el, 'modal-panel--visible');
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