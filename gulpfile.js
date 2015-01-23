var basePaths = {
    src: 'assets/',
    dest: './',
    cache: 'application/templates_c/*.php'
};
var paths = {
    images: {
        src: basePaths.src + 'images/**',
        dest: basePaths.dest + 'images/'
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
var spriteConfig = {
    imgName: 'sprite.png',
    cssName: '_sprite.scss',
    imgPath: paths.images.dest + 'sprite.png' // Gets put in the css
};
var     gulp        =       require('gulp'),
        gutil       =       require('gulp-util'),
        pngquant    =       require('imagemin-pngquant'),
        advpng    =       require('imagemin-advpng'),
        es          =       require('event-stream'), /* ALARM */
        
//         /* ALARM */
//        wait        =       require('gulp-wait'), /* ALARM */ 
        plugins     =       require("gulp-load-plugins")({
                                pattern: ['gulp-*', 'gulp.*'],
                                replaceString: /\bgulp[\-.]/
                            });

var isProduction    = true,
    sassStyle       = 'compressed';

if (gutil.env.dev === true) {
    sassStyle       =   'nested',
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
            new gutil.PluginError('CSS', err, {showStack: true}),
            gutil.beep();
        })
        .pipe(plugins.size())
        .pipe(plugins.sourcemaps.write('/maps/'))
        .pipe(gulp.dest(paths.styles.dest));
});

gulp.task('style', function () {
    var cssFiles = gulp.src(paths.styles.dest+'*.css')
    .pipe(plugins.autoprefixer({
        browsers: ['> 1%', 'last 4 versions', 'safari 5', 'ie 8', 'Firefox >= 20', 'Opera 12.1'],
        cascade: false
    }))
    .pipe(plugins.combineMediaQueries({
        log: true
    }))
    .pipe(plugins.sass({
        errLogToConsole:    true,
        outputStyle:        sassStyle
    }))
    .pipe(plugins.size())
    .pipe(gulp.dest(paths.styles.dest));
});


gulp.task('scripts', function(){
    gulp.src(appFiles.scripts)
        .pipe(plugins.concat('app.js'))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(isProduction ? plugins.uglify() : gutil.noop())
        .pipe(plugins.size())
        .pipe(gulp.dest(paths.scripts.dest));
});

gulp.task('image', function() {
    return gulp.src(paths.images.src)
        .pipe(plugins.cache(
            plugins.imageOptimization({ 
                optimizationLevel: 3, 
                progressive: true, 
                interlaced: true 
            })
        ))
        .pipe(gulp.dest(paths.images.dest))
        .pipe(plugins.size());
});

gulp.task('webp', function () {
    return gulp.src(paths.images.src)
        .pipe(plugins.webp())
        .pipe(gulp.dest(paths.images.dest+'webp/'))
        .pipe(plugins.size());
});

/*
    Sprite Generator
*/

/*
-------
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
/*
-----------
gulp.task('clearcache', function () {
    return gulp.src(basePaths.cache, {read: false})
        .pipe(wait(500))
        .pipe(plugins.rimraf());
});
*/

/*

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
/* ---
});
*/


gulp.task('watch', ['css'], function(){
    gulp.watch(appFiles.styles, ['css']).on('change', function(evt) {
        changeEvent(evt);
    });
});



gulp.task('default', ['css', 'prefixr', 'scripts', 'image', 'clearcache']);







/*
 .pipe(plugins.browsersync.reload({stream:true, once:true})) 
 
*/