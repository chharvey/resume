import * as path from 'path'

import * as xjs from 'extrajs-dom'

import {Processor} from 'template-processor'


const template = xjs.HTMLTemplateElement
	.fromFileSync(path.join(__dirname, './x-skill.tpl.html')) // NB relative to dist
	.node

/**
 * @summary xSkill renderer.
 * @param   {DocumentFragment} frag the template conent with which to render
 * @param   {sdo.Rating} data the data to fill the template
 */
function instructions(frag, data) {
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
const xSkill: Processor<sdo.PostalAddress, XAddressOptsType> = new Processor(template, instructions)
export default xSkill
