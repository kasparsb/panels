function panel(name, $el, props) {

    this.closeCb = undefined;
    this.beforeShowCb = undefined;

    this.name = name;
    this.props = props;

    this.$el = $el;
    this.$w = this.$el.find('.modal-panel__w');
    this.$bg = this.$el.find('.modal-panel__bg');
    this.$header = this.$el.find('.modal-panel__header');

    this.setEvents();
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

    getWidth: function() {
        switch (typeof this.props.width == 'undefined') {
            case 'undefined':
                return 320;
            case 'function':
                return this.props.width();
            default:
                return this.props.width;
        }
    },
    
    applyProgress: function(p) {
        this.setXoffset(this.menuWidth - this.menuWidth*p);
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
        this.setXoffset(this.menuWidth);
        
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