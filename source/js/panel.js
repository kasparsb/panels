import Swipe from 'swipe';
import q from 'dom-helpers/src/q';
import addClass from 'dom-helpers/src/addClass';
import hasClass from 'dom-helpers/src/hasClass';
import removeClass from 'dom-helpers/src/removeClass';
import toggleClass from 'dom-helpers/src/toggleClass';
import addStyle from 'dom-helpers/src/addStyle';
import getWindowScrollTop from 'dom-helpers/src/getWindowScrollTop';
import setWindowScrollTop from 'dom-helpers/src/setWindowScrollTop';
import calcPanelXYOffsetByProgress from './calcPanelXYOffsetByProgress';
import calcAlignXY from './calcAlignXY';
import panelGetProp from './panelGetProp';
import click from 'dom-helpers/src/event/click';
import target from 'dom-helpers/src/event/target';
import parent from 'dom-helpers/src/parent';
import getElementOuterDimensions from 'dom-helpers/src/getOuterDimensions';
import isIos from './isIos';
import isAndroid from './isAndroid';

let defaultAlign = 'center center';
let defaultWidth = 320;
let defaultHideOnOutsideClick = true;

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

    // Šie tiek definēti beforeShow
    this.align;
    this.revealFrom;
    this.revealType;

    /**
     * Pēdējais scrllTop kāds bija aizverot paneli
     * Scroll top ir tas, kur radīja pats panel content
     */
    this.lastScrollTop = 0;

    this.el = el;

    /**
     * Animējamie elementi
     */
    this.elements = {
        'bg': q(this.el, '.modal-panel__bg'),
        'header': q(this.el, '.modal-panel__header'),
        'footer': q(this.el, '.modal-panel__footer'),
        'content': q(this.el, '.modal-panel__content'),
        // Šis tiek izmantots, lai noturētu content scrollTop, kad panelis tiek slēpts
        contentInner: q(this.el, '.modal-panel__content-inner')
    }

    // Ja nav bg, tad obligāti jāuztaisa
    if (!this.elements.bg) {
        this.elements.bg = this.createBg(this.el);
    }

    // Ja ir footer, tad pieliekam klasi
    toggleClass(this.el, 'modal-panel--footer', this.elements.footer);

    //this.swipe = new Swipe(this.el, {'direction': 'horizontal vertical'});

    this.setEvents();
}

panel.prototype = {
    setEvents() {
        click(this.el, ev => {
            let el = target(ev);

            let closePanel = false;

            // Pats panelis, reaģējam uz ārpus paneļa body click
            if (el === this.el) {
                if (this.getProp('hideOnOutsideClick', defaultHideOnOutsideClick)) {
                    closePanel = true;
                }
            }
            // Is close button element
            else if (parent(el, '.modal-panel__close', '.modal-panel')) {
                /**
                 * Reaģējam uz panelī definēto close pogu
                 * closeCb nāk no panelsManager, kura šādā
                 * veidā pateiksim, ka ir jāaizveras
                 */
                closePanel = true;
            }

            if (closePanel) {
                ev.preventDefault();

                if (this.closeCb) {
                    this.closeCb();
                }
            }
        })
    },

    createBg(parent) {
        let r = document.createElement('div');
        r.className = 'modal-panel__bg';
        parent.appendChild(r);
        return r;
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
    //         if (target(ev) == this.el) {
    //             ev.preventDefault();
    //         }
    //     }
    // },

    setOverrideProps(props) {
        this.props2 = props;
    },

    getProp(name, defaultValue, args) {
        return panelGetProp(this.props, this.props2, name, defaultValue, args);
    },

    /**
     * Pirmie argumenti ir elements names
     * Pēdējais arguments ir style properties
     * ja ir tikai viens arguments, tad tie ir style properties
     */
    setElementsStyle(...args) {
        let props = args[args.length-1];

        (args.length > 1
            ? args.slice(0, args.length-1)
            : ['bg', 'header', 'footer', 'content']
        )
            .forEach(el => {
                if (this.elements[el]) {
                    addStyle(this.elements[el], props);
                }
            })
    },

    /**
     * Helper metode ar kuru notur content scrollTop
     * Tā kā panelim tiek uzlikts overflow hidden, tāpēc
     * scrolLTop pazūd un to vajag simulēt ar transform
     */
    preserveContentScrollTop(scrollTop) {
        this.setElementsStyle('contentInner', {
            transform: scrollTop == 0 ? '' : 'translate(0, -'+scrollTop+'px)'
        })
    },

    applyProgress(progress) {
        if (this.revealType == 'slide') {

            this.setXYOffset(
                calcPanelXYOffsetByProgress(
                    this.align,
                    this.revealFrom,
                    this.d.panel,
                    this.d.window,
                    progress
                )
            )
        }
        else if (this.revealType == 'fade') {
            this.setOpacity(1*progress)
        }
    },

    contentInsideScrollable() {
        return {
            position: 'fixed',

            top: (this.align.y + this.d.header.height)+'px',
            height: (this.d.panel.height - this.d.header.height - this.d.footer.height)+'px',

            overflow: 'auto',
            '-webkit-overflow-scrolling': 'touch',
        }
    },
    contentInsideNotScrollable() {
        return {
            position: 'fixed',

            top: (this.align.y + this.d.header.height)+'px',
            height: (this.d.panel.height - this.d.header.height - this.d.footer.height)+'px',

            overflow: 'hidden'
        }
    },
    contentIsScrollable() {
        return {
            position: 'absolute',

            top: (this.align.y + this.d.header.height)+'px',
            minHeight: (this.d.panel.height - this.d.header.height)+'px',
            paddingBottom: this.d.footer.height+'px',

            overflow: ''
        }
    },
    contentIsNotScrollable() {
        return {
            position: 'fixed',

            top: this.align.y+'px',
            paddingTop: this.d.header.height+'px',
            paddingBottom: this.d.footer.height+'px',
            height: '100%',

            overflow: 'hidden'
        }
    },

    getHeaderDimensions() {
        if (this.elements.header) {
            return getElementOuterDimensions(this.elements.header)
        }
        return {width: 0, height: 0}
    },

    getFooterDimensions() {
        if (this.elements.footer) {
            return getElementOuterDimensions(this.elements.footer)
        }
        return {width: 0, height: 0}
    },

    readDimensions() {
        this.d = {
            window: this.getWindowDimensions(), // šo uzstāda manager.js veidojot paneli
            header: this.getHeaderDimensions(),
            footer: this.getFooterDimensions(),
        }

        // Landscape or portrait
        this.d.orientation = this.d.window.width > this.d.window.height ? 'landscape' : 'portrait';

        this.d.panel = {
            width: this.getProp('width', defaultWidth, [this.d.window]),
            /**
             * @todo this.d.window.height - jāpārtaisa par defaultheight=100%
             */
            height: this.getProp('height', this.d.window.height, [this.d.window])
        }

        this.d.isFullHeight = this.d.panel.height >= this.d.window.height,
        this.d.isFullWidth = this.d.panel.width >= this.d.window.width,
        this.d.isCover = this.d.isFullHeight && this.d.isFullWidth;

        this.align = calcAlignXY(this.getProp('align', defaultAlign, [this.d.window]), this.d.panel, this.d.window);
        this.revealFrom = this.getProp('revealFrom', 'left', [this.d.window]);
        this.revealType = this.getProp('revealType', 'none', [this.d.window]);
    },

    setPositionAndSize(isResize) {

        /**
         * ši palīdz uz ios un android ieskrolēt adreses joslu, ja panelis ir bez skrolēšanas
         * Jāuzliek lielāks augstums, kā ekrāna augstums.
         * elements ir absolute pozicionēts tāpēc neko neietekmē, kā tikai ļauj skrollēt
         * kas savukārt dod iespēju pārlūkprogrammai parādīt/noslēpt adreses joslu
         */
        if (this.isScrollHelper) {
            if (isIos || isAndroid) {
                this.setScrollHelperHeight(this.d.window.height * 1.4)
            }
        }

        /**
         * Mobile safari: kad ir ieskrolēts uz adrese joslas ir samazinājusies un
         * bottom navigācijas pogas ir pazudušas:
         * Šajā mirklī jāuzliek windowHeight, lai neparādītos bottom pogas
         * Visi elementi ir fixed, šis būs tas, kas saglabās windowHeight
         * !! Šo ir jādara tikai uz Paneļa atvēršanu.
         * Pēc tam, kad notiek window resize dēļ skrollēšanas un adreses joslas atkal parādās
         * tad ir jāliek 100%
         */
        if (isResize) {
            addStyle(this.el, {height: '100%'})
        }
        else {
            addStyle(this.el, {height: this.d.window.height+'px'})
        }




        /**
         * Ja platums ir tāds pats kā viewport platums, tad ir
         * jāliek 100% lai gadījumā, kad parādās vertical scroll bar,
         * tad neparādītos vertical sctrollbar un nevajadzētu rēķināt
         * scrollbar platumu un atņemt to no platuma
         */
        this.setElementsStyle('bg', 'header', 'content', 'footer', {
            left: this.align.x+'px',
            width: this.d.isFullWidth ? '100%' : this.d.panel.width+'px'
        });

        this.setElementsStyle('bg', 'header', {
            top: this.align.y+'px'
        });

        if (this.d.isFullHeight) {
            this.setElementsStyle('footer', {
                bottom: 0
            });
        }
        else {
            this.setElementsStyle('footer', {
                top: (this.align.y + this.d.panel.height - this.d.footer.height)+'px'
            });
        }

        /**
         * Special case, kad height ir tāds pats kā viewportHeight
         * šajā gadījumā vajag lai background ir lielāks par viewport,
         * lai scrollējot uz mobile safari/chrome nebūtu raustišanās,
         * kad parādās un pazūd bottom menu (kas izraisa ekrāna paaugstināšanos)
         */
        this.setElementsStyle('bg', {
            height: this.d.isFullHeight ? '120%' : this.d.panel.height+'px'
        })



        /**
         * Content elementa scroll stratēģija
         *     contentInsideScrollable
         *     contentInsideNotScrollable
         *     contentIsScrollable
         *     contentIsNotScrollable
         */
        let isContentScrollable = this.getProp('contentScrollable', false, [this.d.window])
        if (this.d.isCover) {
            if (isContentScrollable) {
                this.setElementsStyle('content', this.contentIsScrollable())
            }
            else {
                this.setElementsStyle('content', this.contentIsNotScrollable())
            }
        }
        else {
            if (this.d.isFullHeight) {
                if (isContentScrollable) {
                    this.setElementsStyle('content', this.contentIsScrollable())
                }
                else {
                    this.setElementsStyle('content', this.contentIsNotScrollable())
                }
            }
            else {
                if (isContentScrollable) {
                    this.setElementsStyle('content', this.contentInsideScrollable())
                }
                else {
                    this.setElementsStyle('content', this.contentInsideNotScrollable())
                }
            }
        }
    },

    /**
     * Priekš slide animācijas
     */
    setXYOffset(offset) {
        this.setElementsStyle({
            transform: 'translate3d('+offset.x+'px,'+offset.y+'px,0)'
        })
    },

    setOpacity(opacity) {
        this.setElementsStyle({
            opacity: opacity
        })
    },

    setZIndex(i) {
        addStyle(this.el, {
            zIndex: i
        })
    },

    beforeShow() {
        this.isOpen = true;

        this.readDimensions();

        this.isScrollHelper = this.getProp('addScrollHelper', false, [this.d.window]);

        this.setPositionAndSize();


        // Atjaunojam scrollTop. Uzliekam content elementa Y offset
        if (this.getProp('restoreScrollTop', false)) {
            this.preserveContentScrollTop(this.lastScrollTop);
        }

        this.applyProgress(0);

        addClass(this.el, 'modal-panel--visible');

        /**
         * iOS fix, ja neuzliek transform, tad skrollējot raustīsies fixed header
         */
        addStyle(this.el, {transform: 'translate3d(0,0,0)'});

        if (this.beforeShowCb) {
            this.beforeShowCb();
        }
    },

    afterShow() {
        addClass(this.el, 'modal-panel--ready');

        /**
         * Jānovāc transform, lai uz iOS 12
         * scrollējot neraustītos fixed header
         */
        this.setElementsStyle({
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

    beforeHide() {
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

        removeClass(this.el, 'modal-panel--ready');
    },

    afterHide() {
        removeClass(this.el, 'modal-panel--visible');

        this.preserveContentScrollTop(0);

        // Jānovāc visi inline style deklarācijas no elements
        this.setElementsStyle({
            width: '',
            height: '',
            left: '',
            top: '',
            opacity: '',
            transform: '',
            // content elementam tiek likts overflow atkarībā no panel height
            overflow: '',
            paddingTop: '',
            paddingBottom: ''

            // tikai iOS gadījumā
            ,'-webkit-overflow-scrolling': ''
        })

        this.hideInProgress = false;

        this.isOpen = false;

        // Vienmēr uzliekam 0, ja arī tas nemaz nebija ieslēgts
        this.setScrollHelperHeight(0)
    },

    resize() {
        this.readDimensions();
        this.setPositionAndSize(true);

        /**
         * šis vajadzīgs priekš scroll helper, lai vienmēr ir augšā
         * ja būs lejā, tad nevarēs normāli dabūt atpkaļ address bar
         */
        // if (isIos) {
        //     setWindowScrollTop(0);
        // }
    },

    disable() {
        addClass(this.el, 'modal-panel--disabled');
    },

    enable() {
        removeClass(this.el, 'modal-panel--disabled');
    },

    onClose(cb) {
        this.closeCb = cb
    },

    onBeforeShow(cb) {
        this.beforeShowCb = cb;
    }
}

export default panel