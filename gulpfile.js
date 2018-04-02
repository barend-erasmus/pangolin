const gulp = require('gulp');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');

gulp.task('clean', function () {
    return gulp.src('./dist', { read: false })
        .pipe(clean());
});

gulp.task('copy-index.html', function () {
    return gulp.src('./src/index.html').pipe(gulp.dest('./dist'));
});

gulp.task('copy-package.json', function () {
    return gulp.src('./package.json').pipe(gulp.dest('./dist'));
});

gulp.task('build', function () {
    runSequence(
        'clean',
        'copy-index.html',
        'copy-package.json',
    );
});