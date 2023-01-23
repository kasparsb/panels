/**
 * Te ir jārēķina offset no tekošās paneļa pozīcijas (align.x un align.y)
 * Progresa beigās panel ir jānostājas savā align vietā. Tātad x un y jābūt 0
 * Progresa sākumā jāaprēķina tas attālums, lai paneli novietotu vajadzīgajā starta vietā
 */
export default function(align, revealFrom, panelDimensions, viewportDimensions, progress) {

    if (revealFrom == 'right') {
        /**
         * start pozīcija: tā lai paneļa x ir aiz viewport labās puses
         * (viewportDimensions.width - align.x) - šis ir tas lielums, kādu jāpieliek esošajai
         * align.x pozīcjai, lai izbīdītu ārpus viewport
         * beigu pozīcijā šai vērtībai (viewportDimensions.width - align.x) jābūt 0
         */
        return {
            x: (viewportDimensions.width - align.x.value) - ((viewportDimensions.width - align.x.value)*progress),
            y: 0
        }
    }
    else if (revealFrom == 'left') {
        return {
            x: -((align.x.value + panelDimensions.width) - ((align.x.value + panelDimensions.width)*progress)),
            y: 0
        }
    }
    else if (revealFrom == 'top') {
        return {
            x: 0,
            y: -((align.y.value + panelDimensions.height) - ((align.y.value + panelDimensions.height)*progress))
        }
    }
    else if (revealFrom == 'bottom') {
        return {
            x: 0,
            y: (viewportDimensions.height - align.y.value) - ((viewportDimensions.height - align.y.value)*progress)
        }
    }
}