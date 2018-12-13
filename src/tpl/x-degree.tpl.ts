import * as path from 'path'

import * as xjs from 'extrajs-dom'
import {Processor} from 'template-processor'


const template = xjs.HTMLTemplateElement
	.fromFileSync(path.join(__dirname, './x-degree.tpl.html')) // NB relative to dist
	.node

/**
 * @summary xDegree renderer.
 * @param {DocumentFragment} frag the template conent with which to render
 * @param {!Object} data the data to fill the template
 * @param {number}  data.year year the degree was earned
 * @param {number}  data.gpa grade-point-average
 * @param {string}  data.field type and field of the degree
 */
function instructions(frag, data) {
	frag.querySelector('[itemprop="name"]'       ).innerHTML   = data.field
	frag.querySelector('[itemprop="ratingValue"]').textContent = data.gpa
	if (data.year > 0) {
		frag.querySelector('[itemprop="timeEarned"]'  ).textContent = data.year
		frag.querySelector('.o-ListAchv__Date > small').remove()
	} else {
		frag.querySelector('[itemprop="timeEarned"]').remove()
	}
}

/**
 * Template for processing a postal address, in the format:
 * ```
 * 1600 Pennsylvania Avenue NW
 * Washington, DC 20006
 * ```
 */
const xDegree: Processor<sdo.PostalAddress, XAddressOptsType> = new Processor(template, instructions)
export default xDegree
