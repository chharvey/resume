import * as path from 'path'

import * as xjs from 'extrajs-dom'
import {Processor} from 'template-processor'

import {Skill} from '../interfaces.d'


/**
 * Template for processing a postal address, in the format:
 * ```
 * 1600 Pennsylvania Avenue NW
 * Washington, DC 20006
 * ```
 */
const xSkill: Processor<Skill> = new Processor(
	xjs.HTMLTemplateElement.fromFileSync(path.join(__dirname, '../../src/tpl/x-skill.tpl.html')).node, // NB relative to dist
	(frag, data) => {
		frag.querySelector('dt') !.innerHTML = data.name
		frag.querySelector('slot[name="percentage"]') !.textContent = `${100 * data.ratingValue}`
		new xjs.HTMLElement(frag.querySelector<HTMLMeterElement>('[itemprop="ratingValue"]')!)
			.attr('value', data.ratingValue) // .value(data.ratingValue) // TODO xjs.HTMLMeterElement
			.exe(function () {
				try {
					this.style('--fadein', data.ratingValue) // NB https://github.com/tmpvar/jsdom/issues/1895
				} catch (e) {
					this.node.setAttribute('style', this.node.getAttribute('style') !.replace('1', `${data.ratingValue}`))
				}
			})
	},
);
export default xSkill
