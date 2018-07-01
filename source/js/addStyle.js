var prefixableProps = ['transform'];

function addStyle(el, props) {

    props = vendorPrefix(props);

    for (var name in props) {
        if (!props.hasOwnProperty(name)) {
            continue;
        }

        el.style[name] = props[name];
    }
}

function vendorPrefix(props) {
    var r = {};

    for (var name in props) {
        if (!props.hasOwnProperty(name)) {
            continue;
        }

        r[name] = props[name];

        if (shouldPrefix(name)) {
            r[name] = props[name];
            r['-webkit-'+name] = props[name];
            r['-moz-'+name] = props[name];
            r['-ms-'+name] = props[name];
            r['-o-'+name] = props[name];
        }
    }

    return r;
}

function shouldPrefix(name) {
    return prefixableProps.indexOf(name) >= 0;
}

module.exports = addStyle