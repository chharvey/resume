import * as path from 'path'

import * as xjs from 'extrajs-dom'
import * as sdo from 'schemaorg-jsd/dist/schemaorg' // TODO use an index file
import {Processor} from 'template-processor'


const template = xjs.HTMLTemplateElement
	.fromFileSync(path.join(__dirname, './x-skill.tpl.html')) // NB relative to dist
	.node

function instructions(frag: DocumentFragment, data: sdo.Rating) {
	frag.querySelector('dt'                      ).innerHTML   = data.name
	frag.querySelector('[itemprop="ratingValue"]').value       = data.ratingValue
	frag.querySelector('[itemprop="ratingValue"]').setAttribute('style', frag.querySelector('meter').getAttribute('style').replace('1', data.ratingValue)) // .style.setProperty('--fadein', this._level) // https://github.com/tmpvar/jsdom/issues/1895
	frag.querySelector('slot[name="percentage"]' ).textContent = 100 * (+data.ratingValue)
}

/**
 * Template for processing a postal address, in the format:
 * ```
 * 1600 Pennsylvania Avenue NW
 * Washington, DC 20006
 * ```
 */
const xSkill: Processor<sdo.Rating, object> = new Processor(template, instructions)
export default xSkill
