function hasCssClass(el, className) {
    if (typeof el.classList != 'undefined') {
        el.classList.contains(className);
    }
    else {
        return el.className.match(new RegExp('(?:^|\\s)'+className+'(?!\\S)', 'ig')) ? true : false;
    }
}

module.exports = hasCssClass;