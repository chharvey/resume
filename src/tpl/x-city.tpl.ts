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
	$itemprop?: string;
	/** should I display the full (non-abbreviated) region name? */
	full?: boolean;
}

const template = xjs.HTMLTemplateElement
	.fromFileSync(path.join(__dirname, './x-city.tpl.html')) // NB relative to dist
	.node

function instructions(frag: DocumentFragment, data: ResumeCity & OptsTypeXCity) {
	new xjs.Element(frag.querySelector('[itemtype="http://schema.org/City"]') !)
		.attr('itemprop', data.$itemprop || null)
	new xjs.Element(frag.querySelector('slot[name="address"]') !).empty()
		.append(xAddress.process(data.address, { regionName: true }))

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
const xCity: Processor<ResumeCity & OptsTypeXCity, object> = new Processor(template, instructions)
export default xCity
