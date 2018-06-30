var addCssClass = require('./addCssClass');

function panel(name, $el, props) {

    this.closeCb = undefined;
    this.beforeShowCb = undefined;

    this.name = name;
    this.props = props;

    this.$el = this.prepareEl($el);
    this.$w = this.$el.find('.modal-panel__w');
    this.$bg = this.$el.find('.modal-panel__bg');
    this.$header = this.$el.find('.modal-panel__header');

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

    prepareEl: function($el) {

        // Default align: right
        addCssClass($el.get(0), 'modal-panel--'+this.getAlign())

        return $el;
    },

    getProp: function(name, defaultValue) {
        if (typeof this.props[name] == 'undefined') {
            return defaultValue
        }

        return this.props[name]
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

    getAlign: function() {
        return this.getProp('align', 'right');
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

    /**
     * Interfeiss priekš īstās applyProgress metodes
     * _applyProgress tiek nodefinēts konstruktorā
     */
    applyProgress: function(progress) {
        this._applyProgress(this, progress)
    },

    setXoffset: function(x) {
        this.$w.css('transform', 'translate3d('+x+'px,0,0)')
    },

    setWidth: function(width) {
        this.$w.css('width', width+'px');
        this.$bg.css('width', width+'px');
        this.$header.css('width', width+'px');
    },

    beforeShow: function() {
        this.menuWidth = this.getWidth();

        this.setWidth(this.menuWidth);
        this.applyProgress(0);
        
        this.$el.addClass('modal-panel--visible');

        if (this.beforeShowCb) {
            this.beforeShowCb();
        }
    },

    showPanelDone: function() {
        this.$el.addClass('modal-panel--ready');
        this.$w.css('transform', '')
    },

    beforeHide: function() {
        this.$el.removeClass('modal-panel--ready');
    },

    afterHide: function() {
        this.$el.removeClass('modal-panel--visible');
    },

    disable: function() {
        this.$el.addClass('modal-panel--disabled');
    },

    enable: function() {
        this.$el.removeClass('modal-panel--disabled');
    },

    onClose: function(cb) {
        this.closeCb = cb
    },

    onBeforeShow: function(cb) {
        this.beforeShowCb = cb;
    }
}

module.exports = panel