function isValidAnimBezierCurve(curve) {
    if (typeof curve.show == 'undefined' && typeof curve.hide == 'undefined') {
        return false;
    }

    return true;
}

export default function(d) {
    /**
     * AnimCurve ir definēta ar curve priekš show animācijas
     * un hide, priekš hide animācijas
     */
    // Ja d ir tikai bezier curve
    if (!isValidAnimBezierCurve(d)) {
        // Taisam lai būtu gan show, gan hide un vērtības vienādas
        return {
            show: d,
            hide: d
        }
    }

    // Gadījumā, ja ir tikai vai nu show vai hide
    // tad trūkstošo uztaisām tādu pašu kā esošais
    if (typeof d.show == 'undefined') {
        d.show = d.hide;
    }

    if (typeof d.hide == 'undefined') {
        d.hide = d.show;
    }

    return d;
}