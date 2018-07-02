var addCssClass = require('./addCssClass');
var removeCssClass = require('./removeCssClass');
var addStyle = require('./addStyle');

function panel(name, $el, props) {

    this.closeCb = undefined;
    this.beforeShowCb = undefined;

    this.name = name;
    this.props = props;

    this.el = this.prepareEl($el.get(0));

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
        $(this.el).on('click', '.modal-panel__close', function(ev){
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

    getAlign: function() {
        return this.getProp('align', 'right');
    },

    /**
     * Get width ir konfigurējams no props
     */
    getWidth: function() {
        var width = this.getProp('width', 320);

        switch (typeof width) {
            // Width var nodefinēt kā funkciju
            case 'function':
                return this.props.width();
            default:
                return this.props.width;
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

        switch (panel.getAlign()) {
            case 'right':
                panel.setXoffset(panel.menuWidth - panel.menuWidth * progress);
                break;
            case 'left':
                panel.setXoffset(-(panel.menuWidth - panel.menuWidth * progress));
                break;
        }        
    },

    setXoffset: function(x) {
        this.setAnimableElementsStyle({
            transform: 'translate3d('+x+'px,0,0)'
        })
    },

    setWidth: function(width) {
        this.setAnimableElementsStyle({
            width: width+'px'
        });
    },

    beforeShow: function() {
        this.menuWidth = this.getWidth();

        this.setWidth(this.menuWidth);
        this.applyProgress(0);

        addCssClass(this.el, 'modal-panel--visible');

        if (this.beforeShowCb) {
            this.beforeShowCb();
        }
    },

    showPanelDone: function() {
        addCssClass(this.el, 'modal-panel--ready');
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