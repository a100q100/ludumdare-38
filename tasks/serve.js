var gulp    = require('gulp')

var connect = require('gulp-connect')


gulp.task('_serve', [
  '_build',
  '_watch'
])


gulp.task('_livereload', function() {
  connect.server({
    livereload : true,
    root       : 'build',
    port       : 666,
  })
})

gulp.task('_reload', function() {
  return gulp.src('')
             .pipe(connect.reload())
})


gulp.task('_watch', ['_livereload'], function() {
  gulp.watch('source/game/**/*', ['_build_game'])
  gulp.watch('source/assets/**/*', ['_build_assets'])
  gulp.watch('source/libs/**/*', ['_build_libs'])
  gulp.watch('source/index.html', ['_build_html'])
})