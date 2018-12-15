import * as path from 'path'

import {Date as xjs_Date} from 'extrajs'
import * as xjs from 'extrajs-dom'
import {Processor} from 'template-processor'

import {Prodev} from '../interfaces'
import xCity from './x-city.tpl'


const template = xjs.HTMLTemplateElement
	.fromFileSync(path.join(__dirname, './x-prodev.tpl.html')) // NB relative to dist
	.node

function instructions(frag: DocumentFragment, data: Prodev) {
	let date_start = new Date(data.startDate)
	let date_end   = new Date(data.endDate  )
	let pdh = data.$pdh

	frag.querySelector('.o-ListAchv__Award') !.setAttribute('itemtype', `http://schema.org/${data['@type']}`)
	frag.querySelector('[itemprop="name"]') !.innerHTML = data.name
	new xjs.Element(frag.querySelector('slot[name="city"]') !).empty()
		.append(xCity.process(data.location))
	new xjs.HTMLTimeElement(frag.querySelector('.o-ListAchv__Award > time') as HTMLTimeElement)
		.dateTime(`PT${pdh}H`)
		.textContent(`${pdh} hr`)

	frag.querySelectorAll('[itemprop~="endDate"]').forEach(function (time) {
		new xjs.HTMLTimeElement(time as HTMLTimeElement)
			.dateTime(date_end)
			.textContent(xjs_Date.format(date_end, 'j M Y'))
	})
	if (xjs_Date.sameDate(date_start, date_end)) {
		frag.querySelectorAll('.o-ListAchv__Date')[1].remove()
	} else {
		let same_UTC_date  = date_start.getUTCDate () === date_end.getUTCDate ()
		let same_UTC_month = date_start.getUTCMonth() === date_end.getUTCMonth()
		let same_UTC_year  = date_start.getFullYear() === date_end.getFullYear()
		new xjs.HTMLTimeElement(frag.querySelector('[itemprop="startDate"]') as HTMLTimeElement)
			.dateTime(date_start)
			.textContent([
				date_start.getUTCDate(),
				(!same_UTC_month || !same_UTC_year) ? ` ${xjs_Date.format(date_start, 'M')}` : '',
				(!same_UTC_year) ? ` ${date_start.getFullYear()}` : '',
			].join(''))
		frag.querySelectorAll('.o-ListAchv__Date')[0].remove()
	}
	new xjs.Node(frag.querySelector('.o-ListAchv__Date') !).trimInner()
}

/**
 * Template for processing a postal address, in the format:
 * ```
 * 1600 Pennsylvania Avenue NW
 * Washington, DC 20006
 * ```
 */
const xProdev: Processor<Prodev, object> = new Processor(template, instructions)
export default xProdev
