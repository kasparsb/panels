function getWindowScrollTop() {
    return window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
}

module.exports = getWindowScrollTop
