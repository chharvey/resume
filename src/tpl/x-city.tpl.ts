import * as path from 'path'

import {xAddress} from 'aria-patterns'
import * as xjs from 'extrajs-dom'
import * as sdo from 'schemaorg-jsd/dist/schemaorg' // TODO use an index file
import {Processor} from 'template-processor'

type StateType = { code: string, name: string }
const STATE_DATA: StateType[] = require('extrajs-geo')
STATE_DATA.push(...[
  { "code": "DC", "name": "District of Columbia" },
])


interface OptsTypeXCity { // TODO make this an options param
	/** the value of the `[itemprop]` attribute to write */
	itemprop?: string;
	/** should I display the full (non-abbreviated) region name? */
	full?: boolean;
}

const template = xjs.HTMLTemplateElement
	.fromFileSync(path.join(__dirname, './x-city.tpl.html')) // NB relative to dist
	.node

function instructions(frag: DocumentFragment, data: sdo.City & OptsTypeXCity) {
	new xjs.HTMLElement(frag.querySelector('[itemtype="http://schema.org/City"]'))
		.attr('itemprop', data.$itemprop || null)
	new xjs.HTMLElement(frag.querySelector('slot[name="address"]')).empty()
		.append(xAddress.process(data.address, { regionName: true, $itemprop: 'address' }))

	frag.querySelector('[itemprop="addressLocality"]'  ).textContent = data.address.addressLocality
	frag.querySelector('[itemprop="latitude"]'         ).content     = data.geo.latitude
	frag.querySelector('[itemprop="longitude"]'        ).content     = data.geo.longitude
}

/**
 * Template for processing a postal address, in the format:
 * ```
 * 1600 Pennsylvania Avenue NW
 * Washington, DC 20006
 * ```
 */
const xCity: Processor<sdo.City & OptsTypeXCity, object> = new Processor(template, instructions)
export default xCity
