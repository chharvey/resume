import * as path from 'path'

import * as xjs from 'extrajs-dom'
import {Processor} from 'template-processor'

import {Degree} from '../interfaces.d'


/**
 * Template for processing a postal address, in the format:
 * ```
 * 1600 Pennsylvania Avenue NW
 * Washington, DC 20006
 * ```
 */
const xDegree: Processor<Degree> = new Processor(
	xjs.HTMLTemplateElement.fromFileSync(path.join(__dirname, '../../src/tpl/x-degree.tpl.html')).node, // NB relative to dist
	(frag, data) => {
		frag.querySelector('[itemprop="name"]'       ) !.innerHTML   = data.field
		frag.querySelector('[itemprop="ratingValue"]') !.textContent = `${data.gpa}`
		if (data.year > 0) {
			frag.querySelector('[itemprop="timeEarned"]'  ) !.textContent = `${data.year}`
			frag.querySelector('.o-ListAchv__Date > small') !.remove()
		} else {
			frag.querySelector('[itemprop="timeEarned"]') !.remove()
		}
	},
);
export default xDegree
