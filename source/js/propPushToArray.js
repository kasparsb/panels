export default function(target, propName, value) {
    if (typeof target[propName] == 'undefined') {
        target[propName] = [];
    }
    target[propName].push(value);

    return target;
}