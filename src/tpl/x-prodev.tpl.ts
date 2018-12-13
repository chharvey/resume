import * as path from 'path'

import * as xjs from 'extrajs-dom'
import {Date as xjs_Date} from 'extrajs'
import {Processor} from 'template-processor'

import xCity from './x-city.tpl'


const template = xjs.HTMLTemplateElement
	.fromFileSync(path.join(__dirname, './x-prodev.tpl.html')) // NB relative to dist
	.node

/**
 * @summary xProdev renderer.
 * @param   {DocumentFragment} frag the template conent with which to render
 * @param   {sdo.Event} data the data to fill the template
 * @param   {number} data.$pdh the number of professional development hours
 */
function instructions(frag, data) {
	let date_start = new Date(data.startDate)
	let date_end   = new Date(data.endDate  )
	let pdh = data.$pdh || 0

	frag.querySelector('.o-ListAchv__Award').setAttribute('itemtype', `http://schema.org/${data['@type']}`)
	frag.querySelector('[itemprop="name"]').innerHTML = data.name
	new xjs.HTMLElement(frag.querySelector('slot[name="city"]')).empty()
		.append(xCity.process(data.location || { "@type": "Place" }))
	frag.querySelector('.o-ListAchv__Award > time').dateTime    = `PT${pdh}H`
	frag.querySelector('.o-ListAchv__Award > time').textContent = `${pdh} hr`

	frag.querySelectorAll('[itemprop~="endDate"]').forEach(function (time) {
		new xjs.HTMLTimeElement(time)
			.dateTime(date_end)
			.textContent(xjs_Date.format(date_end, 'j M Y'))
	})
	if (xjs_Date.sameDate(date_start, date_end)) {
		frag.querySelectorAll('.o-ListAchv__Date')[1].remove()
	} else {
		let same_UTC_date  = date_start.getUTCDate () === date_end.getUTCDate ()
		let same_UTC_month = date_start.getUTCMonth() === date_end.getUTCMonth()
		let same_UTC_year  = date_start.getFullYear() === date_end.getFullYear()
		new xjs.HTMLTimeElement(frag.querySelector('[itemprop="startDate"]'))
			.dateTime(date_start)
			.textContent([
				date_start.getUTCDate(),
				(!same_UTC_month || !same_UTC_year) ? ` ${xjs.Date.format(date_start, 'M')}` : '',
				(!same_UTC_year) ? ` ${date_start.getFullYear()}` : '',
			].join(''))
		frag.querySelectorAll('.o-ListAchv__Date')[0].remove()
	}
	new xjs.HTMLElement(frag.querySelector('.o-ListAchv__Date')).trimInner()
}

/**
 * Template for processing a postal address, in the format:
 * ```
 * 1600 Pennsylvania Avenue NW
 * Washington, DC 20006
 * ```
 */
const xProdev: Processor<sdo.PostalAddress, XAddressOptsType> = new Processor(template, instructions)
export default xProdev
