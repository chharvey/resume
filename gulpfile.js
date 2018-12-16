const fs = require('fs')
const path = require('path')
const util = require('util')

const gulp = require('gulp')
const typescript = require('gulp-typescript')
// require('typescript') // DO NOT REMOVE … peerDependency of `gulp-typescript`

const mkdirp = require('make-dir')

const xjs = require('extrajs-dom')

const tsconfig = require('./tsconfig.json')


function dist() {
	return gulp.src('./src/**/*.ts')
		.pipe(typescript(tsconfig.compilerOptions))
		.pipe(gulp.dest('./dist/'))
}

function test_out() {
	return Promise.resolve(null)
}

async function test_run() {
	const {requireOther} = require('schemaorg-jsd/lib/requireOther.js')

	const resume = require('./')
	const DATA = requireOther('./test/src/sample-data.jsonld')

	let contents = new xjs.Document(await resume(DATA)).innerHTML()
	await mkdirp('./test/out/')
	return util.promisify(fs.writeFile)(path.resolve(__dirname, './test/out/test.html'), contents, 'utf8')
}

const test = gulp.series(test_out, test_run)

function docs() {
	return Promise.resolve(null)
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
