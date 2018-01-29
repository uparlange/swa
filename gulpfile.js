'use strict';

const pkg = require('./package.json');

const gulp = require('gulp');
const del = require('del');
const runSequence = require('run-sequence');
const cleanCSS = require('gulp-clean-css');
const mergeStream = require('merge-stream');
const htmlclean = require('gulp-htmlclean');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const gulpCopy = require('gulp-copy');

gulp.task('prepare', () => {
    return del(['./www/prod']);
});

gulp.task('analyze-js', () => {
    return gulp.src(['./www/dev/js/*.js']).pipe(eslint()).pipe(eslint.format()).pipe(eslint.failAfterError());
});

gulp.task('uglify-js', () => {
    return gulp.src('./www/dev/js/*.js').pipe(uglify()).pipe(gulp.dest('./www/prod/js'));
});

gulp.task('optimize-css', () => {
    return gulp.src('./www/dev/css/*.css').pipe(cleanCSS({ level: 2 })).pipe(gulp.dest('./www/prod/css'));
});

gulp.task('optimize-html', () => {
    const streams = mergeStream();
    streams.add(gulp.src('./www/dev/html/*.html').pipe(htmlclean()).pipe(gulp.dest('./www/prod/html')));
    streams.add(gulp.src('./www/dev/index.html').pipe(htmlclean()).pipe(gulp.dest('./www/prod')));
    return streams;
});

gulp.task('optimize-images', () => {
    return gulp.src('./www/dev/images/**/*.*').pipe(imagemin()).pipe(gulp.dest('./www/prod/images'))
});

gulp.task('optimize-js', (callback) => {
    runSequence('analyze-js', 'uglify-js', callback);
});

gulp.task('copy-statics', () => {
    return gulp.src('./www/dev/data/**/*.*').pipe(gulp.dest('./www/prod/data'));
});

gulp.task('default', (callback) => {
    runSequence('prepare', 'copy-statics', 'optimize-css', 'optimize-html', 'optimize-js', 'optimize-images', callback);
});