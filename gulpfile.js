'use strict';

const SRC_FRONT = './src-front';
const SRC_BACK = './src-back';

const pkg = require('./package.json');
const Config = require(SRC_BACK + '/js/Config');

const gulp = require('gulp');
const del = require('del');
const cleanCSS = require('gulp-clean-css');
const mergeStream = require('merge-stream');
const htmlclean = require('gulp-htmlclean');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const jsdoc = require('gulp-jsdoc3');
const fs = require('fs');
const swPrecache = require('sw-precache');

gulp.task('generate-manifest', (callback) => {
    let count = 0;
    const baseDir = SRC_FRONT + '/prod';
    let manifest = '';
    manifest = 'CACHE MANIFEST\n';
    manifest += '# ' + pkg.version + '\n';
    manifest += 'CACHE:\n';
    const readDir = (dir) => {
        fs.readdirSync(dir).forEach((item, index, array) => {
            const path = dir + '/' + item;
            const stats = fs.statSync(path);
            if (stats.isDirectory()) {
                readDir(path);
            }
            else {
                const value = '/' + path.replace(baseDir + '/', '');
                manifest += value + '\n';
                count++;
            }
        });
    };
    readDir(baseDir);
    const viewsConf = Config.getConfig().getExpressStaticsViewsConf();
    viewsConf.files.forEach((file, index, array) => {
        const value = file.path;
        manifest += value + '\n';
        count++;
    });
    const localesConf = Config.getConfig().getExpressStaticsLocalesConf();
    localesConf.files.forEach((file, index, array) => {
        const value = localesConf.path + '/' + file;
        manifest += value + '\n';
        count++;
    });
    const vendorsConf = Config.getConfig().getExpressStaticsVendorsConf();
    vendorsConf.vendors.forEach((vendor, index, array) => {
        vendor.files.forEach((file, index, array) => {
            const value = vendorsConf.path + '/' + file;
            manifest += value + '\n';
            count++;
        });
    });
    manifest += 'NETWORK:\n';
    manifest += '*\n';
    manifest += 'FALLBACK:\n';
    fs.writeFileSync(SRC_FRONT + '/prod/offline.appcache', manifest);
    console.log('Manifest : ' + count + ' resource(s).');
    callback();
});

gulp.task('clean', () => {
    return del([SRC_FRONT + '/dev/js/fwk-pwa-service-worker.js', SRC_FRONT + '/prod']);
});

gulp.task('analyze-js', () => {
    return gulp.src([SRC_FRONT + '/dev/js/*.js']).pipe(eslint()).pipe(eslint.format()).pipe(eslint.failAfterError());
});

gulp.task('uglify-js', () => {
    return gulp.src(SRC_FRONT + '/dev/js/*.js').pipe(uglify()).pipe(gulp.dest(SRC_FRONT + '/prod/js'));
});

gulp.task('copy-css', () => {
    return gulp.src(SRC_FRONT + '/dev/css/*.css').pipe(cleanCSS({ level: 2 })).pipe(gulp.dest(SRC_FRONT + '/prod/css'));
});

gulp.task('copy-html', () => {
    return gulp.src(SRC_FRONT + '/dev/html/*.html').pipe(htmlclean()).pipe(gulp.dest(SRC_FRONT + '/prod/html'));
});

gulp.task('copy-img', () => {
    return gulp.src(SRC_FRONT + '/dev/images/**/*.*').pipe(imagemin()).pipe(gulp.dest(SRC_FRONT + '/prod/images'));
});

gulp.task('generate-service-worker', (callback) => {
    const rootDir = SRC_FRONT + '/prod';
    const fileName = 'fwk-pwa-service-worker.js';
    const dynamicUrlToDependencies = {};
    const viewsConf = Config.getConfig().getExpressStaticsViewsConf();
    viewsConf.files.forEach((file, index, array) => {
        dynamicUrlToDependencies[file.path] = [viewsConf.folder + '/' + file.value];
    });
    const localesConf = Config.getConfig().getExpressStaticsLocalesConf();
    localesConf.files.forEach((file, index, array) => {
        dynamicUrlToDependencies[localesConf.path + '/' + file] = [localesConf.folder + '/' + file];
    });
    const vendorsConf = Config.getConfig().getExpressStaticsVendorsConf();
    vendorsConf.vendors.forEach((vendor, index, array) => {
        vendor.files.forEach((file, index, array) => {
            dynamicUrlToDependencies[vendorsConf.path + '/' + file] = [vendor.folder + '/' + file];
        });
    });
    swPrecache.write(SRC_FRONT + '/dev/js/' + fileName, {
        staticFileGlobs: [
            rootDir + '/**/*'
        ],
        dynamicUrlToDependencies: dynamicUrlToDependencies,
        stripPrefix: rootDir,
    }, function () {
        gulp.src(SRC_FRONT + '/dev/js/' + fileName).pipe(uglify()).pipe(gulp.dest(SRC_FRONT + '/prod/js/'));
        callback();
    });
});

gulp.task('copy-js', gulp.series('analyze-js', 'uglify-js'));

gulp.task('generate-doc', function () {
    const config = require('./jsdoc.json');
    return gulp.src(['./README.md', SRC_FRONT + '/dev/js/fwk.js'], { read: false }).pipe(jsdoc(config));
});

gulp.task('prepare', gulp.parallel('clean'));

gulp.task('finalize', gulp.parallel('generate-service-worker', 'generate-manifest', 'generate-doc'));

gulp.task('run', gulp.parallel('copy-css', 'copy-html', 'copy-js', 'copy-img'));

gulp.task('default', gulp.series('prepare', 'run', 'finalize'));