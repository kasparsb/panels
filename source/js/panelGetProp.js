var validateAnimDurations = require('./validateAnimDurations');
var validateZIndex = require('./validateZIndex');
var validateAlign = require('./validateAlign');

function panelGetProp(props1, props2, name, defaultValue) {
    
    var r = defaultValue;

    // Override props. Šos skatamies pirmos
    if (props2 && typeof props2[name] != 'undefined') {
        r = props2[name];
    }
    // Default props, kuri uzlikti konstruktora laikā
    else if (typeof props1[name] != 'undefined') {
        r = props1[name]
    }

    // Papildus apstrādes noteiktām props
    switch (name) {
        case 'animDurations':
            r = validateAnimDurations(r);
            break;
        case 'zIndex':
            r = validateZIndex(r);
            break;
        case 'align':
            r = validateAlign(r);
            break;
    }

    return r
}

module.exports = panelGetProp