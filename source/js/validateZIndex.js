export default function(d) {
    if (typeof d == 'undefined') {
        d = {};
    }

    if (typeof d.bodyFrame == 'undefined') {
        d.bodyFrame = 1;
    }

    if (typeof d.overlay == 'undefined') {
        d.overlay = 2;
    }

    if (typeof d.panel == 'undefined') {
        d.panel = 3;
    }

    return d;
}