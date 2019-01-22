function eventTarget(ev) {
    var el;

    if (ev.target) {
        el = ev.target;
    }
    else if (ev.srcElement) {
        el = ev.srcElement
    }
    
    // Safari bug. Selected text returns text
    if (el.nodeType == 3) {
        el = el.parentNode
    }

    return el;
}

module.exports = eventTarget