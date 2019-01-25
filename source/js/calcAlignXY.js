function calcAlignXY(align, panelDimensions, viewportDimensions) {
    var r = {
        x: 0,
        y: 0
    }

    if (align.x == 'left') {
        r.x = 0;
    }
    else if (align.x == 'right') {
        r.x = (viewportDimensions.width - panelDimensions.width);
    }

    if (align.y == 'top') {
        r.y = 0;
    }
    else if (align.x == 'bottom') {
        r.y = (viewportDimensions.height - panelDimensions.height);
    }

    return r;
}

module.exports = calcAlignXY