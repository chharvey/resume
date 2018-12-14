import * as path from 'path'

import * as xjs from 'extrajs-dom'
import {Processor} from 'template-processor'


interface DataTypeXDegree {
	/** year the degree was earned */
	year: number;
	/** grade-point-average */
	gpa: number;
	/** type and field of the degree */
	field: string;
}

const template = xjs.HTMLTemplateElement
	.fromFileSync(path.join(__dirname, './x-degree.tpl.html')) // NB relative to dist
	.node

function instructions(frag: DocumentFragment, data: DataTypeXDegree) {
	frag.querySelector('[itemprop="name"]'       ) !.innerHTML   = data.field
	frag.querySelector('[itemprop="ratingValue"]') !.textContent = `${data.gpa}`
	if (data.year > 0) {
		frag.querySelector('[itemprop="timeEarned"]'  ) !.textContent = `${data.year}`
		frag.querySelector('.o-ListAchv__Date > small') !.remove()
	} else {
		frag.querySelector('[itemprop="timeEarned"]') !.remove()
	}
}

/**
 * Template for processing a postal address, in the format:
 * ```
 * 1600 Pennsylvania Avenue NW
 * Washington, DC 20006
 * ```
 */
const xDegree: Processor<DataTypeXDegree, object> = new Processor(template, instructions)
export default xDegree
