export default function(value, customArguments) {
    switch (typeof value) {
        // Value var nodefinēt kā funkciju
        case 'function':
            // Izsaucam ar customArguments
            return value.apply(this, customArguments);
        default:
            return value;
    }
}