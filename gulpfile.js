var gulp = require('gulp');
var minify = require('gulp-minify');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
gulp.task('js', function() {
    gulp.src('src/*.js')
   .pipe(browserify())
   .pipe(minify())
   .pipe(gulp.dest('build'));
 });
gulp.task('css', function(){
   gulp.src('src/*.css')
   .pipe(minify())
   .pipe(gulp.dest('build'));
});

 gulp.task('default',['js','css'],function(){
}); 