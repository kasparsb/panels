var solveValue = require('./solveValue');
var validateAnimDurations = require('./validateAnimDurations');
var validateZIndex = require('./validateZIndex');
var validateAlign = require('./validateAlign');

/**
 * Atgriežam property pēc tā name
 * Katrs property var būt statiska vērtība vai ir funkcija, kuru izsaucot tiks atriezta vērtība
 * @param object Set of default props
 * @param object Set of override props
 * @param string Property name
 * @param string Default value ir property does not exists
 * @param array Array of arguments to pass to propertu value if it is function
 */
function panelGetProp(props1, props2, name, defaultValue, args) {
    if (typeof args == 'undefined') {
        args = [];
    }

    var r = defaultValue;

    // Override props. Šos skatamies pirmos
    if (props2 && typeof props2[name] != 'undefined') {
        r = props2[name];
    }
    // Default props, kuri uzlikti konstruktora laikā
    else if (typeof props1[name] != 'undefined') {
        r = props1[name]
    }

    // Solve property value
    // If r is function it is executed to get value
    switch (name) {
        // these are always callback functions, do not solveValue
        case 'applyProgress':
        case 'onShow':
        case 'onHide':
            break;
        default:
            r = solveValue(r, args);
            break;
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