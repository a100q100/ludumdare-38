var gulp = require('gulp')
var requiredir = require('requiredir')
requiredir('tasks')

gulp.task('serve', ['_serve'])
gulp.task('build', ['_build'])
