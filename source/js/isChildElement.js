function isChildElement(target, element) {
    var n = target.parentNode;
    while (n) {
        if (n == element) {
            return true;
        }
        n = n.parentNode;
    }
    return false;
}

module.exports = isChildElement