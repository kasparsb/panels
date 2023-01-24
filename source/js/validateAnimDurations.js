export default function(d) {
    if (typeof d == 'undefined') {
        d = {};
    }

    /**
     * Pēc noklusējuma liekam base duration vērtības
     * tas ir gadījumā, ja ir uzlikts animācijas veids,
     * lai tā animācija arī nostrādā
     * Ja ir 0 vērtība, tad animācija nestrādās
     */
    if (typeof d.overlay == 'undefined') {
        d.overlay = 100;
    }

    if (typeof d.panel == 'undefined') {
        d.panel = 80;
    }

    return d;
}