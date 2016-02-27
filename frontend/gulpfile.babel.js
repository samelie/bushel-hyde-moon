/* eslint-disable no-undef, no-console */
import bg from 'gulp-bg';
import constants from './webpack/constants';
import del from 'del';
import gulp from 'gulp';
import gutil from 'gulp-util';
import htmlreplace from 'gulp-html-replace';
import path from 'path';
import runSequence from 'run-sequence';
import shell from 'gulp-shell';
import webpackBuild from './webpack/build';
import yargs from 'yargs';
import ip from 'ip';

const args = yargs
	.alias('p', 'production')
	.argv;

const runEslint = () => {
	return gulp.src([
		'gulpfile.babel.js',
		'src/**/*.js',
		'webpack/*.js'
	])
	.pipe(eslint())
	.pipe(eslint.format());
};

/* setup environment */
gulp.task('env', () => {
	process.env.NODE_ENV = args.production ? 'production' : 'development';
	gutil.log('env -', process.env.NODE_ENV);
});

/* clean up build folder */
gulp.task('clean', () => del('build/*'));


gulp.task('build-webpack', ['env'], webpackBuild);
// gulp.task('build', ['build-webpack']);

gulp.task('build', ['clean', 'env'], done => {
	runSequence('build-webpack', 'index', done);
});

gulp.task('eslint', () => {
	return runEslint();
});

gulp.task('eslint-ci', () => {
	// Exit process with an error code (1) on lint error for CI build.
	return runEslint().pipe(eslint.failAfterError());
});

/* server */
gulp.task('server-hot', bg('node', './webpack/server'));
gulp.task('server-nodemon', shell.task(
	// Normalize makes path cross platform.
	path.normalize('node_modules/.bin/nodemon src/server')
));

gulp.task('server', ['env'], done => {
	if (args.production) {
		gutil.log('server production');
		runSequence('clean', 'build', 'index', 'server-node', done);
	} else {
		// runSequence('server-hot', 'server-nodemon', done);
		runSequence('index', 'server-hot', done);
	}
});

/* index.html */
gulp.task('index', () => {
	gutil.log(gutil.colors.bgRed('index', ip.address()));
	gulp.src('src/index.html')
		.pipe(htmlreplace({
			'js': {
				src: args.production ?
				[[`/${require('./assets').app.js}`]] :
				[[`//${ip.address()}:${constants.HOT_RELOAD_PORT}/app.js`]], // eslint-disable-line no-undef
				tpl: '<script id="main-js" type="text/javascript" src="%s"></script>'
			}
		}))
		.pipe(gulp.dest(`build/`));
});

//gulp.task('audio', require('./tasks/audio_task.js').convert);

gulp.task('default', ['server']);
