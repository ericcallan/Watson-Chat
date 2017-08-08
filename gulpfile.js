var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var bourbon = require("node-bourbon").includePaths;
var neat = require("node-neat").includePaths;
var sass = require('gulp-sass');
var browserify = require('browserify');
var babelify = require('babelify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var historyApiFallback = require('connect-history-api-fallback')

/* SASS Compilation task w. Bourbon & Neat */
gulp.task("sass", function() {
	return gulp.src("./resources/assets/sass/**/*.scss")
	.pipe(sass({
		includePaths: bourbon,
		includePaths: neat
	})).on('error', handleErrors)
	.pipe(gulp.dest("./public/css"))
});

/* Image Compilation */
gulp.task('images',function(){
	gulp.src('./resources/assets/images/**')
	.pipe(gulp.dest('./public/images'))
});

/* JS Build Script */
function buildScript(file, watch) {
	var props = {
		entries: ['./resources/assets/scripts/' + file],
		debug : true,
		cache: {},
		packageCache: {},
		transform:  [babelify.configure({presets: ["es2015", "react"]})]
	};

	// watchify() if watch requested, otherwise run browserify() once
	var bundler = watch ? watchify(browserify(props)) : browserify(props);

	function rebundle() {
		var stream = bundler.bundle();
		return stream
		.on('error', handleErrors)
		.pipe(source(file))
		.pipe(gulp.dest('./resources/assets/scripts/compiled'))
		.pipe(buffer())
		.pipe(uglify())
		.pipe(rename('app.min.js'))
		.pipe(gulp.dest('./public/js'))
	}

	// listen for an update and run rebundle
	bundler.on('update', function() {
		rebundle();
		gutil.log('Rebundle...');
	});

	// run it once the first time buildScript is called
	return rebundle();
}

/* Default Error Handler */
function handleErrors() {
	var args = Array.prototype.slice.call(arguments);
		notify.onError({
			title: 'Compile Error',
			message: '<%= error.message %>'
		}).apply(this, args);
	this.emit('end'); // Keep gulp from hanging on this task
}

/* JS Build Script */
gulp.task('scripts', function() {
	return buildScript('main.js', false);
});

/* Default watch script */
gulp.task('default', ['images','sass','scripts'], function() {
	gulp.watch('./resources/assets/sass/**/*.scss', ['sass']);
	return buildScript('main.js', true);
});
