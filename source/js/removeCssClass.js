function removeCssClass(el, className) {
    if (typeof el.classList != 'undefined') {
        el.classList.remove(className);
    }
    else {
        el.className = el.className.replace(new RegExp('(?:^|\\s)'+className+'(?!\\S)', 'ig'), '');
    }
}

module.exports = removeCssClass