function calcPanelXYOffsetByProgress(align, revealDirection, panelWidth, viewportDimensions, progress) {
    if (typeof method[align+revealDirection] != 'undefined') {
        return method[align+revealDirection](panelWidth, viewportDimensions, progress)
    }

    return {
        x: 0,
        y: 0
    }
}

/**
 * Visas dažādās align + revealDirection metodes
 */
var method = {
    leftleft: function(w, vd, p) {
        return {
            x: -(w - w * p),
            y: 0
        }
    },
    
    leftright: function(w, vd, p) {
        return {
            x: vd.width - vd.width * p,
            y: 0
        }
    },

    lefttop: function(w, vd, p) {
        return {
            x: 0,
            y: -(vd.height - vd.height * p)
        }
    },

    leftbottom: function(w, vd, p) {
        return {
            x: 0,
            y: vd.height - vd.height * p
        }
    },


    rightright: function(w, vd, p) {
        return {
            x: w - w * p,
            y: 0
        }
    },

    rightleft: function(w, vd, p) {
        return {
            x: -((vd.width + w) - (vd.width + w) * p),
            y: 0
        }
    },

    righttop: function(w, vd, p) {
        return {
            x: 0,
            y: -(vd.height - vd.height * p)
        }
    },

    rightbottom: function(w, vd, p) {
        return {
            x: 0,
            y: vd.height - vd.height * p
        }
    }
}

module.exports = calcPanelXYOffsetByProgress;