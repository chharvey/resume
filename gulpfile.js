const gulp = require('gulp')

function dist() {
	return gulp.src(['resume.ts', './src/tpl/*.ts'])
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
