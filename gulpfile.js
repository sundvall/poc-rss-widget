var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat');

gulp.task('prior', function () {
	return '';
});

gulp.task('scripts', ['prior'], function () {
	return gulp.src(['src/test4.js','src/*.js'])
		.pipe(concat('all.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});
