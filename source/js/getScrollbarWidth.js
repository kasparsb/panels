
// šitas variants arī darbojas, tikai vajag pārbaudīt
export default function() {
  return window.innerWidth - document.documentElement.clientWidth;
}

// export default function() {
//     // Creating invisible container
//     let parent = document.createElement('div');
//     parent.style.visibility = 'hidden';
//     parent.style.overflow = 'scroll';
//     parent.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
//     document.body.appendChild(parent);

//     let child = document.createElement('div');
//     parent.appendChild(child);

//     // Diffe between parents full width and child width
//     let r = parent.offsetWidth - child.offsetWidth;

//     // Remove
//     parent.parentNode.removeChild(parent);

//     return r;
// }