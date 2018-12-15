import * as path from 'path'

import {xAddress} from 'aria-patterns'
import * as xjs from 'extrajs-dom'
import {Processor} from 'template-processor'

import {ResumeCity} from '../interfaces'

type StateType = { code: string, name: string }
const STATE_DATA: StateType[] = require('extrajs-geo')
STATE_DATA.push(...[
  { "code": "DC", "name": "District of Columbia" },
])


interface OptsTypeXCity { // TODO make this an options param
	/** the value of the `[itemprop]` attribute to write */
	itemprop?: string;
	/**
	 * Should the region code programmatically expanded to its full name?
	 *
	 * (e.g., expand "VA" to "Virginia"), or enter a string to name the region manually
	 */
	regionName?: boolean|string;
}

const template = xjs.HTMLTemplateElement
	.fromFileSync(path.join(__dirname, './x-city.tpl.html')) // NB relative to dist
	.node

function instructions(frag: DocumentFragment, data: ResumeCity, opts: OptsTypeXCity) {
	new xjs.Element(frag.querySelector('[itemtype="http://schema.org/City"]') !)
		.attr('itemprop', opts.itemprop || null)
	new xjs.Element(frag.querySelector('slot[name="address"]') !).empty()
		.append(xAddress.process(data.address, { regionName: opts.regionName }))

	frag.querySelector('[itemprop="addressLocality"]') !.textContent = data.address.addressLocality
	;(frag.querySelector('[itemprop="latitude"]' ) as HTMLMetaElement).content = `${data.geo.latitude}`
	;(frag.querySelector('[itemprop="longitude"]') as HTMLMetaElement).content = `${data.geo.longitude}`
}

/**
 * Template for processing a postal address, in the format:
 * ```
 * 1600 Pennsylvania Avenue NW
 * Washington, DC 20006
 * ```
 */
const xCity: Processor<ResumeCity, OptsTypeXCity> = new Processor(template, instructions)
export default xCity
