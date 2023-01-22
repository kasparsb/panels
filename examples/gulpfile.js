var gulp = require('gulp');
var watch = require('gulp-watch');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream')
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');

var babelify = require('babelify');

// Read package info
var pkg = require('./package.json');

var files = {
    js: './basic.js',
    js2: './ioshorizontal.js',
    dest: './build'
}

/**
 * Configure browserify
 */
function getBrowserify(entry) {
    console.log('Browserify entry', entry);
    return browserify({
        entries: [entry],
        // These params are for watchify
        cache: {},
        packageCache: {}
    })
}

/**
 * Bundel js from browserify
 * If compress is true, then uglify js
 */
function bundleJs(browserify, compress, firstRun, destFileName) {
    if (typeof compress == 'undefined') {
        compress = true;
    }

    if (typeof firstRun == 'undefined') {
        firstRun = true;
    }

    var handleError = function(er){
        console.log(er.message+' on line '+er.line+':'+er.column);
        console.log(er.annotated);
    }

    var s = browserify;

    /**
     * Watchify un Babel gadījumā vajag tikai vienreiz uzstādīt transfor
     * pretējā gadījumā ar katru watchify update eventu transform paliek lēnāks
     */
    if (firstRun) {
        s = s.transform(
            'babelify', {
                presets: [
                    '@babel/env',
                    [
                        '@babel/react',
                        {
                            "pragma": "jsx.h",
                            "pragmaFrag": "jsx.Fragment",
                            "throwIfNamespace": false
                        }
                    ]
                ],
                global: true,
                only: [
                    function(path) {
                        // Enter npm packages which should be compilded by babel
                        if (path.indexOf('/node_modules/dom-helpers/') >= 0) {
                            return true;
                        }

                        // By default compile everything except node_modules
                        if (path.indexOf('/node_modules/') >= 0) {
                            return false;
                        }
                        return true;
                    }
                ]
            }
        )
    }

    s = s
        .bundle()
        .on('error', handleError)
        .pipe(source(destFileName));

    if (compress) {
        console.log('Uglify js');
        s = s.pipe(buffer()).pipe(uglify())
    }

    s.pipe(gulp.dest(files.dest));
}

gulp.task('js', function(){
    bundleJs(getBrowserify(files.js), true, true, 'basic.min.js');
    bundleJs(getBrowserify(files.js2), true, true, 'ioshorizontal.min.js');
});

function watchJs(src, dest) {
    var w = watchify(
        getBrowserify(src, false)
    );

    var first = true;
    w.on('update', function(){
        // bundle without compression for faster response
        bundleJs(w, false, first, dest);

        first = false;

        console.log('js files updated');
    });

    w.bundle().on('data', function() {});
}

gulp.task('watchjs', function(){
    watchJs(files.js, 'basic.min.js')
    watchJs(files.js2, 'ioshorizontal.min.js')
});


gulp.task('default', ['watchjs']);
gulp.task('dist', ['js']);
