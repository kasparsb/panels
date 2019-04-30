var hasCssClass = require('./hasCssClass');

var closeButtonCssClass = 'modal-panel__close';
var panelContainerCssClass = 'modal-panel';

/**
 * Noskaidrojam vai padotais elements ir pane'la close poga
 */
function isPanelCloseButton(el) {
    if (hasCssClass(el, closeButtonCssClass)) {
        return true;
    }

    // Pārbaudām vai el ir iekš close pogas
    var parent = el.parentNode;
    while (parent) {
        if (hasCssClass(parent, closeButtonCssClass)) {
            return true;
        }
        // Esam aizgājuši līdz panel container elementam
        // Ārpus tā close poga vairs nebūs
        if (hasCssClass(parent, panelContainerCssClass)) {
            return false;
        }

        parent = parent.parentNode;
    }
    return false;
}

module.exports = isPanelCloseButton