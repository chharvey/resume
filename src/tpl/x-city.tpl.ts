import * as path from 'path'

import {xAddress} from 'aria-patterns'
import * as xjs from 'extrajs-dom'
import {Processor} from 'template-processor'

type StateType = { code: string, name: string }
const STATE_DATA: StateType[] = require('extrajs-geo')
STATE_DATA.push(...[
  { "code": "DC", "name": "District of Columbia" },
])


const template = xjs.HTMLTemplateElement
	.fromFileSync(path.join(__dirname, './x-city.tpl.html')) // NB relative to dist
	.node

/**
 * @summary xCity renderer.
 * @param   {DocumentFragment} frag the template conent with which to render
 * @param   {sdo.City} data the data to fill the template
 * @param   {string=} data.$itemprop the value of the `[itemprop]` attribute to write, if any
 * @param   {boolean=} data.$full `true` to display the full (non-abbreviated) region name
 */
function instructions(frag, data) {
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
const xCity: Processor<sdo.PostalAddress, XAddressOptsType> = new Processor(template, instructions)
export default xCity
