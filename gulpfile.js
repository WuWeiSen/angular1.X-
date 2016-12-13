'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var wiredep = require('wiredep').stream;
var runSequence = require('run-sequence');
var gulpif = require('gulp-if');
var args = require('get-gulp-args')();
var open = require('open');
var sass = require('gulp-ruby-sass');

var buildEnv = args.env || args.buildEnv || 'dev';


gulp.task('bower', () => {
    return gulp.src('./app/index.html')
        .pipe(wiredep({
            directory: './app/bower_components'
        }))
        .pipe(gulp.dest('./app'));
});

gulp.task('serve', () => {
    runSequence('changEnv', 'start:client');
});

gulp.task('start:client', ['start:proxy'], () => {
    open('http://localhost:9103');
})

gulp.task('start:proxy', function() {
    return $.connect.server({
        root: ['app'],
        port: 9103,
        fallback: 'app/index.html',
        livereload: true,
        middleware: (connect, opts) => {
            var middlewares = [];
            var url = require('url');
            var proxy = require('proxy-middleware');
            var createProxy = (prefixString, proxyServer) => {
                var options = url.parse(proxyServer);
                options.route = prefixString;
                return proxy(options);
            }
            middlewares.push(createProxy('/mockapi', ''));
            middlewares.push(createProxy('/api/v1', ''));
            middlewares.push(createProxy('/api/v1', ''));
            return middlewares;
        }
    });
});

gulp.task('changEnv', function() {
    console.info("=== Build env.js with env '" + buildEnv + "'");
    gulp.src('./config/' + buildEnv + '.js')
        .pipe($.rename('env.js'))
        .pipe(gulp.dest('app/scripts'));
});
