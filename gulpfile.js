const fs = require('fs')
const path = require('path')
const util = require('util')

const gulp         = require('gulp')
const autoprefixer = require('gulp-autoprefixer')
const clean_css    = require('gulp-clean-css')
const inject       = require('gulp-inject-string')
const less         = require('gulp-less')
const rename       = require('gulp-rename')
const sourcemaps   = require('gulp-sourcemaps')
const typescript   = require('gulp-typescript')
// require('typescript') // DO NOT REMOVE … peerDependency of `gulp-typescript`
const mkdirp = require('make-dir')

const { requireJSON } = require('@chharvey/requirejson')
const xjs = require('extrajs-dom')

const tsconfig = require('./tsconfig.json')

const PACKAGE = require('./package.json')
const META = JSON.stringify({
	package: 'https://github.com/chharvey/resume', // `https://www.npmjs.com/package/${PACKAGE.name}`,
	version: PACKAGE.version,
	license: PACKAGE.license,
	built  : new Date().toISOString(),
}, null, '\t')


function dist_ts() {
	return gulp.src('./src/**/*.ts')
		.pipe(typescript(tsconfig.compilerOptions))
		.pipe(gulp.dest('./dist/'))
}

function dist_css() {
	return gulp.src(['./src/css/*.less', '!./src/css/__*.less'])
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(autoprefixer({
			grid: true,
			cascade: false,
		}))
		.pipe(clean_css({
			level: {
				2: {
					overrideProperties: false, // need fallbacks for `initial` and `unset`
					restructureRules: true, // combines selectors having the same rule (akin to `&:extend()`) // REVIEW be careful here
				},
			},
		}))
		.pipe(rename((p) => {
			if (p.basename[0] === '_') {
				p.basename = p.basename.slice(1)
			}
		}))
		.pipe(inject.prepend(`/* ${META} */`))
		.pipe(sourcemaps.write('./')) // writes to an external .map file
		.pipe(gulp.dest('./dist/css/'))
}

const dist = gulp.parallel(dist_ts, dist_css)

function test_out() {
	return Promise.resolve(null)
}

async function test_run() {
	const resume = require('./')

	const DATA = requireJSON('./test/src/sample-data.jsonld')
	const OPTS = {
		scripts: [
			`<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-AMS-MML_HTMLorMML,https://chharvey.github.io/chhlib/mathjax-localconfig.js"></script>`,
		],
	}

	let doc = (await Promise.all([
		resume(DATA, OPTS),
		mkdirp('./test/out/'),
	]))[0]

	return util.promisify(fs.writeFile)(path.resolve(__dirname, './test/out/test.html'), new xjs.Document(doc).innerHTML(), 'utf8')
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
	dist_ts,
	dist_css,
	dist,
	test_out,
	test_run,
	test,
	docs,
	build,
}
