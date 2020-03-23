const gulp = require('gulp'),
      browserSync = require('browser-sync');

gulp.task('html', function () {
    return gulp.src('*.html')
        .pipe(browserSync.stream({reload:true}))
});

gulp.task('js', function () {
    return gulp.src('js/*.js')
        .pipe(browserSync.stream({reload: true}))
});

gulp.task('css', function () {
    return gulp.src('*.css')
        .pipe(browserSync.stream({reload: true}))
});

gulp.task('browser-sync', function () {
    browserSync.init({
        server:{
            baseDir:'./'
        }
    })
});

gulp.task('watch', function () {
    gulp.watch('*.html', gulp.parallel('html'));
    gulp.watch('js/*.js', gulp.parallel('js'));
    gulp.watch('*.css', gulp.parallel('css'));
});

gulp.task('default', gulp.parallel('browser-sync', 'watch'));