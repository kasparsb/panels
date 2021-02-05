export default function(align, panelDimensions, viewportDimensions) {
    let r = {
        x: 0,
        y: 0
    }

    if (align.x == 'left') {
        r.x = 0;
    }
    else if (align.x == 'right') {
        r.x = (viewportDimensions.width - panelDimensions.width);
    }
    else if (align.x == 'center') {
        r.x = (viewportDimensions.width - panelDimensions.width) / 2;
    }

    if (align.y == 'top') {
        r.y = 0;
    }
    else if (align.y == 'bottom') {
        r.y = (viewportDimensions.height - panelDimensions.height);
    }
    else if (align.y == 'center') {
        r.y = (viewportDimensions.height - panelDimensions.height) / 2;
    }

    return r;
}