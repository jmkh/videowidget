var gulp = require('gulp');
var minify = require('gulp-minify');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
var template = require('gulp-template');
var paths = require('./models/_config');
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

gulp.task('html', function(){
   gulp.src('frames_tpl/*.html')
   .pipe(template({path: paths.scripts_path,vast_path:paths.scripts_path}))
   .pipe(gulp.dest('iframes'));
});
gulp.task('vast', function() {
    gulp.src(['src/myvast.js'],['src/mpvpaid.js'])
        .pipe(browserify())
        .pipe(minify())
        .pipe(gulp.dest('build'));
});
gulp.task('advark', function() {
    gulp.src('src/advark.js')
        .pipe(browserify())
        .pipe(minify())
        .pipe(gulp.dest('build'));
});
gulp.task('advideo', function() {
    gulp.src('src/advideo.js')
        .pipe(browserify())
        .pipe(minify())
        .pipe(gulp.dest('build'));
});
gulp.task('dispatcher', function() {
    gulp.src('src/myautoplay.js')
        .pipe(browserify())
        .pipe(minify())
        .pipe(gulp.dest('build'));
});
gulp.task('inpage', function() {
    gulp.src('src/inpage.js')
        .pipe(browserify())
        .pipe(minify())
        .pipe(gulp.dest('build'));
});
 gulp.task('default',['js','css','html'],function(){
}); 