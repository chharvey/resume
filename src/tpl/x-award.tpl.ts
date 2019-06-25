import * as path from 'path'

import * as xjs from 'extrajs-dom'
import {Processor} from 'template-processor'

import {Award} from '../interfaces.d'


const template = xjs.HTMLTemplateElement
	.fromFileSync(path.join(__dirname, '../../src/tpl/x-award.tpl.html')) // NB relative to dist
	.node

function instructions(frag: DocumentFragment, data: Award): void {
	frag.querySelector('slot[name="text"]' ) !.innerHTML = data.text
	frag.querySelector('slot[name="dates"]') !.innerHTML = data.dates

	let subs: Element = frag.querySelector('.o-ListAchv__Award > .o-ListAchv') !
	if (data.sub_awards) {
		subs.append(...data.sub_awards.map((s) => xAward.process(s)))
	} else subs.remove()
}

/**
 * Template for processing a postal address, in the format:
 * ```
 * 1600 Pennsylvania Avenue NW
 * Washington, DC 20006
 * ```
 */
const xAward: Processor<Award> = new Processor(template, instructions)
export default xAward
