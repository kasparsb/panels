function addEvent(obj, type, fn, params) {
    params = (typeof params == 'undefined' ? false : params);
    if ( obj.attachEvent ) {
        obj['e'+type+fn] = fn;
        obj[type+fn] = function(){obj['e'+type+fn](window.event)}
        obj.attachEvent('on'+type, obj[type+fn]);
    }
    else {
        obj.addEventListener(type, fn, params);
    }
}

function removeEvent(obj, type, fn, params) {
    params = (typeof params == 'undefined' ? false : params);
    if ( obj.detachEvent ) {
        obj.detachEvent( 'on'+type, obj[type+fn] );
        obj[type+fn] = null;
    }
    else {
        obj.removeEventListener(type, fn, params);
    }
}

function preventEvent(ev) {
    if (ev.preventDefault) {
        ev.preventDefault();
    }
    else {
        ev.returnValue = false;
    }
}

/**
 * Normalize event.target
 */
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

module.exports = {
    addEvent: addEvent,
    removeEvent: removeEvent,
    preventEvent: preventEvent,
    eventTarget: eventTarget
}