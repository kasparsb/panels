function validateAnimDurations(d) {
    if (typeof d == 'undefined') {
        d = {};
    }

    if (typeof d.overlay == 'undefined') {
        d.overlay = 0;
    }

    if (typeof d.panel == 'undefined') {
        d.panel = 0;
    }

    return d;
}

module.exports = validateAnimDurations