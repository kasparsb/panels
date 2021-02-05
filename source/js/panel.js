import Swipe from 'swipe';
import q from 'dom-helpers/src/q';
import addClass from 'dom-helpers/src/addClass';
import hasClass from 'dom-helpers/src/hasClass';
import removeClass from 'dom-helpers/src/removeClass';
import toggleClass from 'dom-helpers/src/toggleClass';
import addStyle from 'dom-helpers/src/addStyle';
import getWindowDimensions from 'dom-helpers/src/getWindowDimensions';
import getWindowScrollTop from 'dom-helpers/src/getWindowScrollTop';
import setWindowScrollTop from 'dom-helpers/src/setWindowScrollTop';
import calcPanelXYOffsetByProgress from './calcPanelXYOffsetByProgress';
import calcAlignXY from './calcAlignXY';
import panelGetProp from './panelGetProp';
import click from 'dom-helpers/src/event/click';
import target from 'dom-helpers/src/event/target';
import parents from 'dom-helpers/src/parents';
import getElementOuterDimensions from 'dom-helpers/src/getOuterDimensions';

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

    /**
     * Paneļa platums. Šis tiek ņemts no props.width
     * Ar šo mainīgo width tiek iekešots un tiek ielasīts
     * tikai vienu reizi beforeShow eventā
     */
    this.panelDimensions = { width: 0, height: 0 }
    this.windowDimensions = { width: 0, height: 0 }

    // Tiek izmantots, lai korekti nopozicionētu content elementu
    this.headerDimensions = { width: 0, height: 0 }
    this.footerDimensions = { width: 0, height: 0 }

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
    this.animableElements = {
        'bg': q(this.el, '.modal-panel__bg'),
        'header': q(this.el, '.modal-panel__header'),
        'footer': q(this.el, '.modal-panel__footer'),
        'content': q(this.el, '.modal-panel__content'),
        // Šis tiek izmantots, lai noturētu content scrollTop, kad panelis tiek slēpts
        'content-inner': q(this.el, '.modal-panel__content-inner')
    }

    // Ja nav bg, tad obligāti jāuztaisa
    if (!this.animableElements.bg) {
        this.animableElements.bg = this.createBg(this.el);
    }

    // Ja ir footer, tad pieliekam klasi
    toggleClass(this.el, 'modal-panel--footer', this.animableElements.footer);

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
            else if (parents(el, '.modal-panel__close', '.modal-panel')) {
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

    setAnimableElementsStyle(cssProps, items) {

        if (typeof items == 'undefined') {
            items = ['bg', 'header', 'footer', 'content'];
        }

        items.forEach(item => {
            if (this.animableElements[item]) {
                addStyle(this.animableElements[item], cssProps);
            }
        })
    },

    /**
     * Helper metode ar kuru notur content scrollTop
     * Tā kā panelim tiek uzlikts overflow hidden, tāpēc
     * scrolLTop pazūd un to vajag simulēt ar transform
     */
    preserveContentScrollTop(scrollTop) {
        if (this.animableElements['content-inner']) {
            this.setAnimableElementsStyle({
                transform: scrollTop == 0 ? '' : 'translate(0, -'+scrollTop+'px)'
            }, ['content-inner'])
        }
    },

    applyProgress(progress) {
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
    setXYOffset(offset) {
        this.setAnimableElementsStyle({
            transform: 'translate3d('+offset.x+'px,'+offset.y+'px,0)'
        })
    },

    setOpacity(opacity) {
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
    setWidth(width) {
        this.setAnimableElementsStyle({
            width: width >= this.windowDimensions.width ? '100%' : width+'px'
        });
    },

    setHeight(height, width, headerDimensions, footerDimensions) {
        /**
         * Mobile safari: jāuzliek windowHeight, lai neparādītos bottom pogas
         * Visi elementi ir fixed, šis būs tas, kas saglabās windowHeight
         * @todo Te vēl vajadzētu uzlikt touchstart eventu, lai varētu atcelt
         * overscroll
         */
        addStyle(this.el, {height: this.windowDimensions.height+'px'})


         /*
          * Ja paneļa platums, augstums ir vienāds ar window. Panelis nosedz visu ekrānu,
          * tad content elementam neliekam augstumu. Overflow scrollēšana notiks
          * uz visu dokumentu nevis content elementā
          */
        if (width >= this.windowDimensions.width && height >= this.windowDimensions.height) {
            // Notīrām augstumu un overflow
            this.setAnimableElementsStyle({
                height: height+'px',
                overflow: 'auto',
                boxSizing: 'border-box',
                // Atbrīvojam vietu priekš header un footer
                paddingTop: headerDimensions.height+'px',
                paddingBottom: footerDimensions.height+'px'
            }, ['content'])
        }
        /**
         * Paneļa augstums ir mazāks par window height. Tāpēc augstums ir jāliek content elementa
         * Scroll notiks content elementā
         */
        else {
            /**
             * Chrome uz Android: ja height == window.height, tad scrollēšana overlow elementā ir tā pat
             * kā uz document. Tobiš skrollējot uz augštu pazūd adreses josla, uz leju parādās
             * Ja kaut par vienu pixeli atšķiras, tad adreses josla stāv uz vietas
             */
            this.setAnimableElementsStyle({
                height: (height - headerDimensions.height - footerDimensions.height)+'px',
                top: (this.align.y + headerDimensions.height)+'px',
                overflow: 'auto',
                boxSizing: '',
                paddingTop: '',
                paddingBottom: ''

                // Tikai iOS gadījumā
                //'overflow-y': 'scroll',
                //'-webkit-overflow-scrolling': 'touch'
            }, ['content'])
        }


        /**
         * Special case, kad height ir tāds pats kā viewportHeight
         * šajā gadījumā vajag lai background ir lielāks par viewport,
         * lai scrollējot uz mobile safari/chrome nebūtu raustišanās,
         * kad parādās un pazūd bottom menu (kas izraisa ekrāna paaugstināšanos)
         */
        if (height >= this.windowDimensions.height) {
            this.setAnimableElementsStyle({height: '120%'}, ['bg'])
        }
        else {
            this.setAnimableElementsStyle({height: height+'px'}, ['bg'])
        }
    },

    setZIndex(i) {
        addStyle(this.el, {
            zIndex: i
        })
    },

    setPosition() {
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
    setFooterPosition(panelWidth, panelHeight, dimensions) {
        if (!this.animableElements.footer) {
            return
        }

        // Footer vajag pozicionēt pret panel apakšu
        this.setAnimableElementsStyle({
            left: this.align.x+'px',
            top: (this.align.y + panelHeight - dimensions.height)+'px'
        }, ['footer']);
    },

    getHeaderDimensions() {
        if (this.animableElements.header) {
            return getElementOuterDimensions(this.animableElements.header)
        }
        return {width: 0, height: 0}
    },

    getFooterDimensions() {
        if (this.animableElements.footer) {
            return getElementOuterDimensions(this.animableElements.footer)
        }
        return {width: 0, height: 0}
    },

    beforeShow() {
        this.isOpen = true;

        this.windowDimensions = getWindowDimensions();

        this.panelDimensions = {
            width: this.getProp('width', defaultWidth, [this.windowDimensions]),
            height: this.getProp('height', this.windowDimensions.height, [this.windowDimensions])
        };

        this.headerDimensions = this.getHeaderDimensions();
        this.footerDimensions = this.getFooterDimensions();

        this.align = calcAlignXY(this.getProp('align', defaultAlign, [this.windowDimensions]), this.panelDimensions, this.windowDimensions);
        this.revealFrom = this.getProp('revealFrom', 'left', [this.windowDimensions]);
        this.revealType = this.getProp('revealType', 'none', [this.windowDimensions]);

        this.setPosition();
        this.setWidth(this.panelDimensions.width);
        this.setHeight(this.panelDimensions.height, this.panelDimensions.width, this.headerDimensions, this.footerDimensions);

        // Atjaunojam scrollTop. Uzliekam content elementa Y offset
        if (this.getProp('restoreScrollTop', false)) {
            this.preserveContentScrollTop(this.lastScrollTop);
        }

        this.applyProgress(0);

        /**
         * @todo addClass rada bremzi un Stepper pirmais solis izpildās daudz reiz vēlāk
         * Tā kā --visible uzstāda tikai display:block, tad lieka to caur style property
         */
        addClass(this.el, 'modal-panel--visible');
        //addStyle(this.el, {display: 'block'});

        /**
         * @todo Iespējams, ka vajag pārtaisīt, lai footer ir relatīvs pret content container
         * Pašlaik footer tiek poziconēts ar top, jo tas ie neatkarīgi no panel izmēriem
         */
        this.setFooterPosition(this.panelDimensions.width, this.panelDimensions.height, this.footerDimensions);

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

        // Jānovāc visi inline style deklarācijas no animableElements
        this.setAnimableElementsStyle({
            width: '',
            height: '',
            left: '',
            top: '',
            opacity: '',
            transform: '',
            // content elementam tiek likts overflow atkarībā no panel height
            overflow: '',
            boxSizing: '',
            paddingTop: '',
            paddingBottom: ''

            // tikai iOS gadījumā
            //'overflow-y': '',
            //'-webkit-overflow-scrolling': ''
        })

        this.hideInProgress = false;

        this.isOpen = false;
    },

    resize() {
        this.windowDimensions = getWindowDimensions();

        this.panelDimensions = {
            width: this.getProp('width', defaultWidth, [this.windowDimensions]),
            height: this.getProp('height', this.windowDimensions.height, [this.windowDimensions])
        };

        this.headerDimensions = this.getHeaderDimensions();
        this.footerDimensions = this.getFooterDimensions();

        this.align = calcAlignXY(this.getProp('align', defaultAlign, [this.windowDimensions]), this.panelDimensions, this.windowDimensions);
        this.revealFrom = this.getProp('revealFrom', 'left', [this.windowDimensions]);
        this.revealType = this.getProp('revealType', 'none', [this.windowDimensions]);

        this.setPosition();
        this.setWidth(this.panelDimensions.width);
        this.setHeight(this.panelDimensions.height, this.panelDimensions.width, this.headerDimensions, this.footerDimensions);

        /**
         * @todo Iespējams, ka vajag pārtiasīt, lai footer ir relatīvs pret content container
         * Pašlaik footer tiek poziconēts ar top, jo tas ie neatkarīgi no panel izmēriem
         */
        this.setFooterPosition(this.panelDimensions.width, this.panelDimensions.height, this.footerDimensions);
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