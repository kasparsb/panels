/**
 * Align tiek definēts līdzīgi kā backgroundPosition: pa x asi, pa y asi
 */
function validateAlign(align) {
    align = align.split(' ');

    var r = [];
    for (var i = 0; i < align.length; i++) {
        if (align[i] != '') {
            r.push(align[i]);
        }
    }

    return {
        x: r.length > 0 ? r[0] : 'left',
        y: r.length > 1 ? r[1] : 'top'
    }
}

module.exports = validateAlign