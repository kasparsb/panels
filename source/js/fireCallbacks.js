export default function(callbacksArray, args) {
    callbacksArray.forEach(cb => cb.apply(this, args))
}