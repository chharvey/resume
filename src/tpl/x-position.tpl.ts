import * as path from 'path'

import * as xjs from 'extrajs-dom'
import {Date as xjs_Date} from 'extrajs'
import * as sdo from 'schemaorg-jsd/dist/schemaorg' // TODO use an index file
import {Processor} from 'template-processor'

import xCity, {DataTypeXCity} from './x-city.tpl'


interface DataTypeXPosition extends sdo.JobPosting {
	$start: string;
	$end?: string;
	identifier: string;
	title: string;
	jobLocation: DataTypeXCity;
	hiringOrganization: sdo.Organization & {
		'@type': string;
		name: string;
	};
}

const template = xjs.HTMLTemplateElement
	.fromFileSync(path.join(__dirname, './x-position.tpl.html')) // NB relative to dist
	.node

function instructions(frag: DocumentFragment, data: DataTypeXPosition) {
	let date_start = new Date(data.$start)
	let date_end   = (data.$end) ? new Date(data.$end) : null
	let descriptions = (typeof data.responsibilities === 'string') ? [data.responsibilities] : data.responsibilities || []  // FIXME use string[]

	frag.querySelector('.c-Position'       ) !.id        = data.identifier
	frag.querySelector('[itemprop="title"]') !.innerHTML = data.title
	frag.querySelector('[itemprop="hiringOrganization"]') !.setAttribute('itemtype', `http://schema.org/${data.hiringOrganization['@type']}`)
	frag.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]') !.innerHTML = data.hiringOrganization.name
	new xjs.HTMLAnchorElement(frag.querySelector('[itemprop="hiringOrganization"] [itemprop="url"]') as HTMLAnchorElement)
		.href(data.hiringOrganization.url || null)

	new xjs.HTMLTimeElement(frag.querySelectorAll('.c-Position__Dates > time')[0] as HTMLTimeElement)
		.dateTime(date_start.toISOString())
		.textContent(xjs_Date.format(date_start, 'M Y'))
	if (date_end) {
		new xjs.HTMLTimeElement(frag.querySelectorAll('.c-Position__Dates > time')[1] as HTMLTimeElement)
			.dateTime(date_end)
			.textContent(xjs_Date.format(date_end, 'M Y'))
		frag.querySelectorAll('.c-Position__Dates > time')[2].remove()
	} else {
		;(frag.querySelectorAll('.c-Position__Dates > time')[2] as HTMLTimeElement).dateTime = new Date().toISOString()
		frag.querySelectorAll('.c-Position__Dates > time')[1].remove()
	}

	new xjs.Element(frag.querySelector('.c-Position__Place > slot[name="city"]') !).empty()
		.append(new xjs.Node(xCity.process({ ...data.jobLocation, $itemprop: 'jobLocation' })).trimInner())

	new xjs.HTMLUListElement(frag.querySelector('.c-Position__Body') as HTMLUListElement).populate(function (f, d) {
		f.querySelector('li') !.innerHTML = d
	}, descriptions)

	new xjs.Element(frag.querySelector('.c-Position__Dates') !).trimInner()
}

/**
 * Template for processing a postal address, in the format:
 * ```
 * 1600 Pennsylvania Avenue NW
 * Washington, DC 20006
 * ```
 */
const xPosition: Processor<DataTypeXPosition, object> = new Processor(template, instructions)
export default xPosition
