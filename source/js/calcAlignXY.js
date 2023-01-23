export default function(align, panelDimensions, viewportDimensions) {
    let r = {
        x: {
            side: 'left',
            value: 0
        },
        y: {
            side: 'top',
            value: 0
        }
    }

    /**
     * vērtība varbūt vienkārši vārdiska pozīcija (left, right, top, bottom)
     * vai vērtība plus skaitliska nobīda (left:20)
     * tas nozīmē, ka jānovieto kreisajā pusē ar 20 pec nobīdi
     */
    let x = align.x.split(':');
    let xside = x[0];
    let xoffset = parseInt(x.length > 1 ? x[1] : 0, 10);
    if (isNaN(xoffset)) {
        xoffset = 0;
    }

    let y = align.y.split(':');
    let yside = y[0];
    let yoffset = parseInt(y.length > 1 ? y[1] : 0, 10);
    if (isNaN(yoffset)) {
        yoffset = 0;
    }

    r.x.side = xside;
    if (xside == 'left') {
        r.x.value = 0;
    }
    else if (xside == 'right') {
        r.x.value = (viewportDimensions.width - panelDimensions.width);
        xoffset = xoffset*-1;
    }
    else if (xside == 'center') {
        r.x.value = (viewportDimensions.width - panelDimensions.width) / 2;
    }
    else {
        r.x.value = 0
    }
    r.x.value = r.x.value + xoffset;


    r.y.side = yside;
    if (yside == 'top') {
        r.y.value = 0;
    }
    else if (yside == 'bottom') {
        r.y.value = (viewportDimensions.height - panelDimensions.height);
        yoffset = yoffset*-1;
    }
    else if (yside == 'center') {
        r.y.value = (viewportDimensions.height - panelDimensions.height) / 2;
    }
    else {
        r.y.value = 0
    }
    r.y.value = r.y.value + yoffset;

    return r;
}