function propPushToArray(target, propName, value) {
    if (typeof target[propName] == 'undefined') {
        target[propName] = [];
    }
    target[propName].push(value);

    return target;
}

module.exports = propPushToArray