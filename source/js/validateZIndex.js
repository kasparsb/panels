export default function(d) {
    let baseZIndex = 100;

    // Vai ir padots zIndex kā number
    if (d && typeof d != 'object') {
        // tad uzskatām par base zIndex
        baseZIndex = parseInt(d, 10);
        if (isNaN(baseZIndex)) {
            baseZIndex = 1;
        }
    }

    // Defaults
    let r = {
        bodyFrame: baseZIndex,
        overlay: baseZIndex + 5,
        panel: baseZIndex + 10
    }

    // Ja ir nodefinēti atsevišķi zIndex katram elementam
    if (d) {
        if (typeof d.bodyFrame != 'undefined') {
            r.bodyFrame = d.bodyFrame;
        }

        if (typeof d.overlay != 'undefined') {
            r.overlay = d.overlay;
        }

        if (typeof d.panel != 'undefined') {
            r.panel = d.panel;
        }
    }

    console.log(r);

    return r;
}