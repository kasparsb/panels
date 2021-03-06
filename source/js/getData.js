export default function(object, propName, defaultValue) {
    if (typeof object == 'undefined') {
        return defaultValue;
    }
    if (typeof object[propName] == 'undefined') {
        return defaultValue;
    }

    return object[propName];
}