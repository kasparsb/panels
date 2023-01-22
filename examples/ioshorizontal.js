import q from 'dom-helpers/src/q';
import qa from 'dom-helpers/src/qa';
import addStyle from 'dom-helpers/src/addStyle';
import infinityswipe from 'infinityswipe';
import setWindowScrollTop from 'dom-helpers/src/setWindowScrollTop';
import getWindowDimensions from 'dom-helpers/src/getWindowDimensions';



let infty = new infinityswipe(q('.slider'), qa('.slide'));

function sizeScrollHelpers() {
    addStyle('.horizontal', {height: (getWindowDimensions().height * 1.6)+'px'})
    setWindowScrollTop(0)
}

sizeScrollHelpers();

window.addEventListener('resize', function(){
    infty.resize();
    sizeScrollHelpers();
})
