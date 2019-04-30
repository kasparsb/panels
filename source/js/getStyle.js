function getStyle(el, propName) {

    if (typeof el.style[propName] != 'undefined') {
        return el.style[propName];
    }
    
    return '';
}

module.exports = getStyle