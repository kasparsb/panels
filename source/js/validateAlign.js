/**
 * Align tiek definēts līdzīgi kā backgroundPosition: pa x asi, pa y asi
 */
export default function(align) {
    let r = align.split(' ').filter(a => a != '')

    return {
        x: r.length > 0 ? r[0] : 'left',
        y: r.length > 1 ? r[1] : 'top'
    }
}