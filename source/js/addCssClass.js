var hasCssClass = require('./hasCssClass');

function addCssClass(el, className) {
    if (hasCssClass(el, className)) {
        return;
    }

    if (typeof el.classList != 'undefined') {
        el.classList.add(className);
    }
    else {
        el.className += ' '+className;
    }
}

module.exports = addCssClass