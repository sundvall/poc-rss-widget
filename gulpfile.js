//required
var gulp = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync'),
	browserify = require('browserify'),
	del = require('del'),
	reload = browserSync.reload,
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	plumber = require('gulp-plumber'),
	rename = require('gulp-rename'),
	source = require('vinyl-source-stream'),
	sass = require('gulp-sass');

////////////////////////////////////////////////////////////////////////////
//scripts tasks
////////////////////////////////////////////////////////////////////////////

gulp.task('browserify', function () {
	return browserify('./app/js/main.js')
		.bundle()
	//Pass desired output filename to vinyl-source-stream
	.pipe(source('bundle.js'))
	// .pipe(uglify())
	// .pipe(rename('bundle.min.js'))
	// .pipe(plumber())
	.pipe(gulp.dest('./dist/js/'))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('scripts', ['browserify']);

// gulp.task('scripts', function () {
// 	return gulp.src(['app/js/**/*.js'])
// 		.pipe(plumber())
// 		.pipe(concat('all.min.js'))
// 		.pipe(uglify())
// 		.pipe(gulp.dest('app/dist'))
// 		.pipe(reload({
// 			stream: true
// 		}));
// });

////////////////////////////////////////////////////////////////////////////
//css tasks
////////////////////////////////////////////////////////////////////////////
gulp.task('css:sass', function () {
	gulp.src('app/scss/**/*.scss')
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(sass({
			// outputStyle: 'compressed'
			outputStyle: 'expanded'
		}))
		.pipe(autoprefixer({
		browsers: ['last 2 versions'],
		cascade: true,
		remove: true
	}))
		.pipe(rename('rss_widget.css'))
		.pipe(gulp.dest('dist/css'))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('css', ['css:sass']);

////////////////////////////////////////////////////////////////////////////
//html tasks
////////////////////////////////////////////////////////////////////////////
gulp.task('html:copy_index_to_dist', function () {
	return gulp.src(['app/html/index.html'])
		.pipe(gulp.dest('./dist/'));
});
gulp.task('html', ['html:copy_index_to_dist'], function () {
	gulp.src(['app/**/*.html'])
		.pipe(reload({
			stream: true
		}));
});

////////////////////////////////////////////////////////////////////////////
//Browser-sync tasks
////////////////////////////////////////////////////////////////////////////
gulp.task('browser-sync', function () {
	browserSync({
		server: {
			baseDir: "./dist/"
		}
	});
});

//task to run build server for test final app
gulp.task('build:serve', function () {
	browserSync({
		server: {
			baseDir: "./build/"
		}
	});
});

////////////////////////////////////////////////////////////////////////////
//watch task
////////////////////////////////////////////////////////////////////////////
gulp.task('watch', function () {
	gulp.watch('app/js/**/*.js', ['scripts']);
	gulp.watch('app/**/*.html', ['html']);
	gulp.watch('app/scss/**/*.scss', ['css']);
});

////////////////////////////////////////////////////////////////////////////
//Build tasks
////////////////////////////////////////////////////////////////////////////

//delete old build folder
gulp.task('build:cleanfolder', function (cb) {
	del(['build/**'], cb);
});

//create new build folder
gulp.task('build:copy', ['build:cleanfolder'], function (cb) {
	//copy app folder into build folder
	return gulp.src('dist/**/*')
		.pipe(gulp.dest('build/'));
});

//delete unwanted files and folders
gulp.task('build:remove', ['build:copy'], function (cb) {
	//del(['build/scss/', 'build/js/!(*.min.js)'], cb);
});

gulp.task('build', ['build:copy', 'build:remove', 'build:serve']);


////////////////////////////////////////////////////////////////////////////
//default task
////////////////////////////////////////////////////////////////////////////
gulp.task('default', ['scripts', 'css', 'html', 'browser-sync', 'watch']);
