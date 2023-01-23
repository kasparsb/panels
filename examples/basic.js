import Panels from '../source/js/app';


import append from 'dom-helpers/src/append';
import toggleClass from 'dom-helpers/src/toggleClass';
import clickp from 'dom-helpers/src/event/clickp';
import getWindowDimensions from 'dom-helpers/src/getWindowDimensions';
import setWindowScrollTop from 'dom-helpers/src/setWindowScrollTop';
import q from 'dom-helpers/src/q';
import jsx from 'dom-helpers/src/jsx';

//Panels.init();

function createRow(count) {
    let r = [];
    for (let i = 1; i <= count; i++) {
        r.push(<div class="r">{i}</div>)
    }
    return r;
}

function createPanel(name, size, isScroll, rowsCount) {
    let el = (
        <div class="modal-panel">
            <header class="modal-panel__header">{name}</header>
            <section class="modal-panel__content">
                {createRow(rowsCount)}
            </section>
            <footer class="modal-panel__footer">footer</footer>
        </div>
    )

    append('body', el);

    Panels.register(name, el, {
        revealType: 'slide',
        revealFrom: 'left',
        animDurations: {
            overlay: 200,
            panel: 400
        },
        addScrollHelper: true,
        width(viewportDimensions) {
            switch (size) {
                case 'cover':
                case 'fw': return viewportDimensions.width;
                case 'small':
                case 'fh': return viewportDimensions.width * 0.7;
            }
        },
        height(viewportDimensions) {
            switch (size) {
                case 'cover':
                case 'fh': return viewportDimensions.height;
                case 'small':
                case 'fw': return 200//return viewportDimensions.height * 0.7;
            }

        },
        contentScrollable() {
            return isScroll
        }
    });
}

let w = 1;
let logEl = q('.log');
function reportWindowSize() {
    if (logEl) {
        let {width, height} = getWindowDimensions();
        logEl.innerHTML = (w++)+'resize: '+width+' x '+height;
    }
}

let st = 0;
window.addEventListener('resize', reportWindowSize);

clickp('.controls button', (ev, el) => {
    if (el.name == 'resize') {
        Panels.resize();
        return;
    }
    else if (el.name == 'window') {
        reportWindowSize();
        return;
    }
    else if (el.name == 'scroll') {
        setWindowScrollTop(1);
        return;
    }



    let scroll = parseInt(el.dataset.scroll, 10) ? true : false;
    let rowsCount = parseInt(el.dataset.rows, 10);

    let name = el.dataset.size+'_'+(scroll ? 'scroll' : 'notscroll')+'_'+rowsCount;

    let panel = Panels.get(name);
    if (!panel) {
        createPanel(name, el.dataset.size, scroll, rowsCount);
    }
    Panels.toggle(name)

    toggleClass(el, 'open', Panels.isOpen(name));
});

clickp('[name=openminimal]', () => {
    let el = (
        <div class="modal-panel">
            <section class="modal-panel__content">
                Minimal, Sint veniam commodo magna in proident eu in consequat.
            </section>
        </div>
    )

    append('body', el);

    Panels.register('minimal', el, {
        align(viewportDimensions) {
            if (viewportDimensions.width > 600) {
                return 'right:20 top:20';

            }
            else {
                return 'left:0 top:0';
            }
        },
        //align: 'center center',
        width(viewportDimensions) {
            return viewportDimensions.width * 0.7;
        },
        height(viewportDimensions) {
            return viewportDimensions.height * 0.7;
        }
    });

    Panels.show('minimal');
})