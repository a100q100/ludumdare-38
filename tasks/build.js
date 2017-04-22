var gulp   = require('gulp')

var sourcemaps = require('gulp-sourcemaps');
var uglify     = require('gulp-uglify')
var rename     = require('gulp-rename')
var replace    = require('gulp-replace')
var connect    = require('gulp-connect')
var concat     = require('gulp-concat')
var babelify   = require('babelify')
var minifyHTML = require('gulp-htmlmin')
var browserify = require('browserify')
var source     = require('vinyl-source-stream')
var buffer     = require('vinyl-buffer')

gulp.task('_build', [
  '_build_game',
  '_build_assets',
  '_build_libs',
  '_build_html'
])


gulp.task('_build_game', () => {
  // Merge all files from the `source/index.js`, imports will be relative to source/
  return browserify({
      debug   : true,
      entries : 'source/game/index.js',
      paths   : ['./source/game/']
    })

    // Tranform ES6 to ES5
    .transform(babelify.configure({
      presets            : ['es2015'],
      sourceMapsAbsolute : true,
      sourceMaps         : true
    }))
    .bundle()

    // Final file name
    .pipe(source('game.min.js'))
    .pipe(buffer())

    // Open source map
    .pipe(sourcemaps.init({loadMaps: true}))

      // Uglify the file
      .pipe(uglify({preserveComments:'license'})
        .on('error', e => {
          console.error(`Error: ${e.message}\nLine: ${e.lineNumber}`)
        }))

    // Close and save source map
    .pipe(sourcemaps.write('.', {
      sourceRoot: 'source/game/',
    }))

    // Save the file
    .pipe(gulp.dest('build/libs'))

    // Reload if running on serve
    .pipe(connect.reload())
})

gulp.task('_build_assets', () => {
  gulp.src('source/assets/**/*')
    .pipe(gulp.dest('build/assets'))
    .pipe(connect.reload())
})

gulp.task('_build_libs', () => {
  gulp.src('source/libs/**/*')
    .pipe(gulp.dest('build/libs'))
    .pipe(connect.reload())
})

gulp.task('_build_html', () => {
  return gulp
    .src('source/index.html')
    .pipe(minifyHTML({
      caseSensitive: true,
      collapseWhitespace: true,
      minifyJS: true,
      removeComments: true
    }))
    .pipe(gulp.dest('build'))
    .pipe(connect.reload())
})
