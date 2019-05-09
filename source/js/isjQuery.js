function isjQuery(obj) {
    if (obj && typeof obj.jquery != 'undefined') {
        return true;
    }
    return false;
}

module.exports = isjQuery