import * as path from 'path'

import * as xjs from 'extrajs-dom'
import {Date as xjs_Date} from 'extrajs'
import {Processor} from 'template-processor'

import xCity from './x-city.tpl'


const template = xjs.HTMLTemplateElement
	.fromFileSync(path.join(__dirname, './x-position.tpl.html')) // NB relative to dist
	.node

/**
 * @summary xPosition renderer.
 * @param   {DocumentFragment} frag the template conent with which to render
 * @param   {sdo.JobPosting} data the data to fill the template
 */
function instructions(frag, data) {
	let date_start = new Date(data.$start)
	let date_end   = (data.$end) ? new Date(data.$end) : null
	let descriptions = (typeof data.responsibilities === 'string') ? [data.responsibilities] : data.responsibilities || []

	frag.querySelector('.c-Position'       ).id        = data.identifier
	frag.querySelector('[itemprop="title"]').innerHTML = data.title
	frag.querySelector('[itemprop="hiringOrganization"]').setAttribute('itemtype', `http://schema.org/${data.hiringOrganization['@type']}`)
	frag.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]').innerHTML = data.hiringOrganization.name
	new xjs.HTMLAnchorElement(frag.querySelector('[itemprop="hiringOrganization"] [itemprop="url"]')/* as HTMLAnchorElement*/)
		.href(data.hiringOrganization.url || null)

	new xjs.HTMLTimeElement(frag.querySelectorAll('.c-Position__Dates > time')[0])
		.dateTime(date_start.toISOString())
		.textContent(xjs_Date.format(date_start, 'M Y'))
	if (date_end) {
		new xjs.HTMLTimeElement(frag.querySelectorAll('.c-Position__Dates > time')[1])
			.dateTime(date_end)
			.textContent(xjs_Date.format(date_end, 'M Y'))
		frag.querySelectorAll('.c-Position__Dates > time')[2].remove()
	} else {
		frag.querySelectorAll('.c-Position__Dates > time')[2].dateTime = new Date().toISOString()
		frag.querySelectorAll('.c-Position__Dates > time')[1].remove()
	}

	new xjs.HTMLElement(frag.querySelector('.c-Position__Place > slot[name="city"]')).empty()
		.append(new xjs.DocumentFragment(xCity.process({ ...data.jobLocation, $itemprop: 'jobLocation' })).trimInner())

	new xjs.HTMLUListElement(frag.querySelector('.c-Position__Body')).populate(function (f, d) {
		f.querySelector('li').innerHTML = d
	}, descriptions)

	new xjs.HTMLElement(frag.querySelector('.c-Position__Dates')).trimInner()
}

/**
 * Template for processing a postal address, in the format:
 * ```
 * 1600 Pennsylvania Avenue NW
 * Washington, DC 20006
 * ```
 */
const xPosition: Processor<sdo.PostalAddress, XAddressOptsType> = new Processor(template, instructions)
export default xPosition
