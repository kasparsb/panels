function calcPanelXYOffsetByProgress(align, revealDirection, panelDimensions, viewportDimensions, progress) {
    if (typeof method[align+revealDirection] != 'undefined') {
        return method[align+revealDirection](panelDimensions, viewportDimensions, progress)
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
    leftleft: function(pd, vd, p) {
        return {
            x: -(pd.width - pd.width * p),
            y: 0
        }
    },
    
    leftright: function(pd, vd, p) {
        return {
            x: vd.width - vd.width * p,
            y: 0
        }
    },

    lefttop: function(pd, vd, p) {
        return {
            x: 0,
            y: -(pd.height - pd.height * p)
        }
    },

    leftbottom: function(pd, vd, p) {
        return {
            x: 0,
            y: vd.height - vd.height * p
        }
    },


    rightright: function(pd, vd, p) {
        return {
            x: pd.width - pd.width * p,
            y: 0
        }
    },

    rightleft: function(pd, vd, p) {
        return {
            x: -((vd.width + pd.width) - (vd.width + pd.width) * p),
            y: 0
        }
    },

    righttop: function(pd, vd, p) {
        return {
            x: 0,
            y: -(pd.height - pd.height * p)
        }
    },

    rightbottom: function(pd, vd, p) {
        return {
            x: 0,
            y: vd.height - vd.height * p
        }
    }
}

module.exports = calcPanelXYOffsetByProgress;