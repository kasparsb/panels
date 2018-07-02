function getWindowDimensions() {
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0];

    return {
        width: w.innerWidth || e.clientWidth || g.clientWidth,
        height: w.innerHeight|| e.clientHeight|| g.clientHeight
    }
}

module.exports = getWindowDimensions;