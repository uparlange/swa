'use strict';

const SRC_FRONT = "./src-front";
const SRC_BACK = "./src-back";

const pkg = require('./package.json');
const Config = require(SRC_BACK + '/js/Config');

const gulp = require('gulp');
const del = require('del');
const runSequence = require('run-sequence');
const cleanCSS = require('gulp-clean-css');
const mergeStream = require('merge-stream');
const htmlclean = require('gulp-htmlclean');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const jsdoc = require('gulp-jsdoc3');
const fs = require('fs');

gulp.task('prepare', () => {
    return del([SRC_FRONT + '/prod']);
});

gulp.task('analyze-js', () => {
    return gulp.src([SRC_FRONT + '/dev/js/*.js']).pipe(eslint()).pipe(eslint.format()).pipe(eslint.failAfterError());
});

gulp.task('uglify-js', () => {
    return gulp.src(SRC_FRONT + '/dev/js/*.js').pipe(uglify()).pipe(gulp.dest(SRC_FRONT + '/prod/js'));
});

gulp.task('optimize-css', () => {
    return gulp.src(SRC_FRONT + '/dev/css/*.css').pipe(cleanCSS({ level: 2 })).pipe(gulp.dest(SRC_FRONT + '/prod/css'));
});

gulp.task('optimize-html', () => {
    const streams = mergeStream();
    streams.add(gulp.src(SRC_FRONT + '/dev/html/*.html').pipe(htmlclean()).pipe(gulp.dest(SRC_FRONT + '/prod/html')));
    streams.add(gulp.src(SRC_FRONT + '/dev/index.html').pipe(htmlclean()).pipe(gulp.dest(SRC_FRONT + '/prod')));
    return streams;
});

gulp.task('optimize-images', () => {
    return gulp.src(SRC_FRONT + '/dev/images/**/*.*').pipe(imagemin()).pipe(gulp.dest(SRC_FRONT + '/prod/images'))
});

gulp.task('optimize-js', (callback) => {
    runSequence('analyze-js', 'uglify-js', callback);
});

gulp.task('copy-statics', () => {
    return gulp.src(SRC_FRONT + '/dev/data/**/*.*').pipe(gulp.dest(SRC_FRONT + '/prod/data'));
});

gulp.task('generate-doc', function () {
    const config = require('./jsdoc.json');
    return gulp.src(['./README.md', SRC_FRONT + '/dev/js/fwk.js'], { read: false }).pipe(jsdoc(config));
});
gulp.task('generate-manifest', (callback) => {
    const baseDir = SRC_FRONT + '/dev';
    const readDir = (dir) => {
        fs.readdirSync(dir).forEach((item, index, array) => {
            if (item !== '.' && item !== '..') {
                const path = dir + '/' + item;
                const stats = fs.statSync(path);
                if (stats.isDirectory()) {
                    readDir(path);
                }
                else {
                    content += path.replace(baseDir + '/', '') + '\n';
                }
            }
        });
    };
    let content = '';
    content = 'CACHE MANIFEST\n';
    content += '# ' + pkg.version + '\n';
    content += 'CACHE:\n';
    // application files
    readDir(baseDir);
    // vendor files
    Config.getConfig().expressStaticsVendors.forEach((folder, index, array) => {
        folder.files.forEach((file, index, array) => {
            content += 'vendors/' + file + '\n';
        });
    });
    content += 'NETWORK:\n';
    content += '*\n';
    content += 'FALLBACK:\n';
    fs.writeFileSync(SRC_FRONT + '/prod/manifest.cache', content);
    callback();
});

gulp.task('default', (callback) => {
    runSequence('prepare', 'copy-statics', 'optimize-css', 'optimize-html', 'optimize-js', 'optimize-images', 'generate-manifest', 'generate-doc', callback);
});