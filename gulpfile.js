var basePaths = {
    src: 'assets/',
    dest: './',
    bower: 'bower_components/',
    cache: 'application/templates_c/*.php'
};
var paths = {
    images: {
        src: basePaths.src + 'img/**',
        dest: basePaths.dest + 'img/'
    },
    scripts: {
        src: basePaths.src + 'js/',
        dest: basePaths.dest + 'js/'
    },
    styles: {
        src: basePaths.src + 'sass/',
        dest: basePaths.dest + 'css/'
    },
    sprite: {
        src: basePaths.src + 'sprite/*'
    }
};
var appFiles = {
    styles: paths.styles.src + '*.scss',
    scripts: [paths.scripts.src + '*.js']
};
var vendorFiles = {
    styles: '',
    scripts: ''
};
var spriteConfig = {
    imgName: 'sprite.png',
    cssName: '_sprite.scss',
    imgPath: paths.images.dest + 'sprite.png' // Gets put in the css
};
/*
    Let the magic begin
*/
var     gulp        =       require('gulp'),
        es          =       require('event-stream'), /* ALARM */
        gutil       =       require('gulp-util'),
//        pngquant    =       require('imagemin-pngquant'), /* ALARM */
//        wait        =       require('gulp-wait'), /* ALARM */ 
        plugins     =       require("gulp-load-plugins")({
                                pattern: ['gulp-*', 'gulp.*'],
                                replaceString: /\bgulp[\-.]/
                            });


var isProduction    = true,
    sassStyle       = 'compressed';


if (gutil.env.dev === true) {
    sassStyle       =   'nested'

    isProduction    =   false;
}

var changeEvent = function(evt) {
    gutil.log('File', gutil.colors.cyan(evt.path.replace(new RegExp('/.*(?=/' + basePaths.src + ')/'), '')), 'was', gutil.colors.magenta(evt.type));
};

gulp.task('css', function () {
    var sassFiles = gulp.src(appFiles.styles)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass({
            errLogToConsole:    true,
            outputStyle:        sassStyle
        }))
        .on('error', function(err){
            new gutil.PluginError('CSS', err, {showStack: true});
        })
        .pipe(plugins.autoprefixer({
            browsers: ['> 1%', 'last 4 versions', 'safari 5', 'ie 8', 'Firefox >= 20', 'Opera 12.1'],
            cascade: false
        }))
        .pipe(isProduction ? plugins.combineMediaQueries({
            log: true
        }) : gutil.noop())
        .pipe(plugins.size())
        .pipe(plugins.sourcemaps.write('/maps/'))
        .pipe(gulp.dest(paths.styles.dest));
});



/*

gulp.task('css', function(){

    var sassFiles = gulp.src(appFiles.styles)

    
    .on('error', function(err){
        new gutil.PluginError('CSS', err, {showStack: true});
    });

    return es.concat(gulp.src(vendorFiles.styles), sassFiles)
      pipe(plugins.concat('style.min.css')) 
        .pipe(plugins.autoprefixer('last 3 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        
        .pipe(isProduction ? plugins.combineMediaQueries({
            log: true
        }) : gutil.noop())

       .pipe(isProduction ? plugins.cssmin() : gutil.noop())


        .pipe(plugins.size())
        .pipe(gulp.dest(paths.styles.dest))
 /*       .pipe(plugins.browsersync.reload({stream:true, once:true}))  */
  /*      .pipe(plugins.notify("css complete."));
});

*/

/*
gulp.task('css', function () {
    return gulp.src(appFiles.styles)
        .pipe(plugins.rubySass({style: sassStyle, sourcemap: false}))
        .pipe(plugins.autoprefixer('last 3 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .on('error', function (err) { new gutil.PluginError('CSS', err, {showStack: true}); })
        .pipe(plugins.minifyCss({keepBreaks:true,compatibility:'ie7'}))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(plugins.size())
        .pipe(plugins.notify("css complete."));
});

*/



gulp.task('prefixr', function () {
    return gulp.src(paths.styles.dest+'/*.css')
        .pipe(plugins.autoprefixer('> 2%', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(plugins.minifyCss({keepBreaks:false,compatibility:'ie7'}))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(plugins.size());
});


gulp.task('scripts', function(){

    gulp.src(vendorFiles.scripts.concat(appFiles.scripts))
        .pipe(plugins.concat('app.js'))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(isProduction ? plugins.uglify() : gutil.noop())
        .pipe(plugins.size())
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(plugins.notify("JS complete."));

});

/*
gulp.task('image', function () {
    return gulp.src(paths.images.src)
        .pipe(plugins.cache(
            plugins.imageOptimization({ optimizationLevel: 3, progressive: true, interlaced: true }) 
        ))
        .pipe(gulp.dest(paths.images.dest))
        .pipe(reload({stream:true, once:true})) 
        .pipe(plugins.size()); 
});
*/

gulp.task('image', function () {
    return gulp.src(paths.images.src)
        .pipe(plugins.imageOptimization({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(paths.images.dest));
});

/*
    Sprite Generator
*/
gulp.task('sprite', function () {
    var spriteData = gulp.src(paths.sprite.src).pipe(plugins.spritesmith({
        imgName: spriteConfig.imgName,
        cssName: spriteConfig.cssName,
        imgPath: spriteConfig.imgPath,
        cssVarMap: function (sprite) {
            sprite.name = 'sprite-' + sprite.name;
        }
    }));
    spriteData.img.pipe(gulp.dest(paths.images.dest));
    spriteData.css.pipe(gulp.dest(paths.styles.src));
});

/*
    Clear cache
*/
gulp.task('clearcache', function () {
    return gulp.src(basePaths.cache, {read: false})
        .pipe(wait(500))
        .pipe(plugins.rimraf());
});

gulp.task('watch', ['sprite', 'css', 'prefixr', 'scripts'], function(){
    gulp.watch(appFiles.styles, ['css', 'prefixr', 'image', 'clearcache']).on('change', function(evt) {
        changeEvent(evt);
    });
    gulp.watch(basePaths.cache, ['clearcache']).on('change', function(evt) {
        changeEvent(evt);
    });
    gulp.watch(paths.scripts.src + '*.js', ['scripts']).on('change', function(evt) {
        changeEvent(evt);
    });
/*    gulp.watch(paths.images.src, ['image']).on('change', function(evt) {
        changeEvent(evt);
    });
*/
});

gulp.task('default', ['css', 'prefixr', 'scripts', 'image', 'clearcache']);