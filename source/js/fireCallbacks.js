function fireCallbacks(callbacksArray, args) {
    for (var i = 0; i < callbacksArray.length; i++) {
        callbacksArray[i].apply(this, args);
    }
}

module.exports = fireCallbacks;