import * as path from 'path'

import {Object as xjs_Object} from 'extrajs'
import * as xjs from 'extrajs-dom'
import {Processor} from 'template-processor'


interface DataTypeXAward {
	/** date(s) relevant to the award */
	dates: string;
	/** custom HTML string defining this award */
	text: string;
	/** any sub-awards associated with this award */
	sub_awards?: DataTypeXAward[]
}

const template = xjs.HTMLTemplateElement
	.fromFileSync(path.join(__dirname, './x-award.tpl.html')) // NB relative to dist
	.node

function instructions(frag: DocumentFragment, data: DataTypeXAward) {
	/**
	 * @summary Generate content from strings.
	 * @private
	 * @param   {(string|Array<string>)} x a string, or array of strings
	 * @returns {string} the string, or the joined array
	 */
	function _content(x) { // TODO don’t use arrays for line breaks
		return (xjs_Object.typeOf(x) === 'array') ? x.join('') : x
	}
	frag.querySelector('slot[name="text"]' ).innerHTML = _content(data.text)
	frag.querySelector('slot[name="dates"]').innerHTML = data.dates

	let subs = frag.querySelector('.o-ListAchv__Award > .o-ListAchv')
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
const xAward: Processor<DataTypeXAward, object> = new Processor(template, instructions)
export default xAward
