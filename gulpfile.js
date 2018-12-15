const gulp = require('gulp')
const typescript = require('gulp-typescript')
// require('typescript') // DO NOT REMOVE … peerDependency of `gulp-typescript`

const tsconfig = require('./tsconfig.json')


function dist() {
	return gulp.src(['./src/**/*.ts'])
		.pipe(typescript(tsconfig.compilerOptions))
		.pipe(gulp.dest('./dist/'))
}

function test_out() {
}

function test_run() {
}

const test = gulp.series(test_out, test_run)

function docs() {
}

const build = gulp.parallel(
	gulp.series(
		gulp.parallel(
			dist,
			test_out
		),
		test_run
	),
	docs
)

module.exports = {
	dist,
	test_out,
	test_run,
	test,
	docs,
	build,
}
