import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'

import * as Ajv from 'ajv'
import { JSDOM } from 'jsdom'

import {xPersonFullname} from 'aria-patterns'
import * as xjs from 'extrajs-dom'
import {Processor} from 'template-processor'

import octicons from '../octicons.d' // NB contributed: https://github.com/primer/octicons/pull/268
const octicons: octicons = require('octicons')

const sdo_jsd = require('schemaorg-jsd')
const [META_SCHEMATA, SCHEMATA]: Promise<object[]>[] = [
	sdo_jsd.getMetaSchemata(),
	sdo_jsd.getSchemata(),
]
const {requireOther} = require('schemaorg-jsd/lib/requireOther.js')

const RESUME_SCHEMA = requireOther(path.join(__dirname, '../../src/resume.jsd')) // NB relative to dist

const VERSION: string = require('../../package.json').version

import {ResumePerson, SkillGroup, JobPositionGroup, Skill, JobPosition, Prodev, Award} from '../interfaces.d'
import xAward    from '../tpl/x-award.tpl'
import xDegree   from '../tpl/x-degree.tpl'
import xPosition from '../tpl/x-position.tpl'
import xProdev   from '../tpl/x-prodev.tpl'
import xSkill    from '../tpl/x-skill.tpl'


interface OptsTypeResume {
	/** `innerHTML` of any `<script>` elements to append to the end of `<body>`. */
	scripts?: string[];
}

const doc: Document = xjs.Document.fromFileSync(path.join(__dirname, '../../src/doc/resume.doc.html')).importLinks(__dirname).node // NB relative to dist

async function instructions(document: Document, data: ResumePerson, opts: OptsTypeResume): Promise<void> {
	/**
	 * Adjust local stylesheet hrefs.
	 */
	await (async () => {
		/**
		 * Are we using a development environment? (Is a `.git` directory present?)
		 *
		 * If true, `link[rel~="stylesheet"]` elements should point to relative urls instead of a CDN.
		 */
		let dev_env: boolean;
		try {
			await util.promisify(fs.readdir)(path.join(__dirname, '../../.git'))
			dev_env = true
		} catch (e) {
			dev_env = false
		}
		if (!dev_env) {
			;(document.querySelectorAll('link[rel~="stylesheet"][data-local]') as NodeListOf<HTMLLinkElement>).forEach((link) => {
				let matches: RegExpMatchArray|null = link.href.match(/[\w\-]*\.css/)
				if (matches === null) throw new ReferenceError(`No regex match found in \`${link.href}\`.`)
				link.href = path.join(`https://cdn.jsdelivr.net/gh/chharvey/resume@${VERSION}/dist/css/`, matches[0])
			})
		}
	})()

	new xjs.Element(document.querySelector('main header [itemprop="name"]') !).empty().append(
		xPersonFullname.process({
			familyName      : data.familyName      || '',
			givenName       : data.givenName       || '',
			additionalName  : data.additionalName  || '',
			honorificPrefix : data.honorificPrefix || '',
			honorificSuffix : data.honorificSuffix || '',
		})
	)

	;(() => {
		let dataset: {
			itemprop : string;
			icon     : keyof octicons;
			href     : string|null;
			text     : string|null;
		}[] = [
			{
				itemprop: 'telephone',
				icon: 'device-mobile',
				href: (data.telephone) ? `tel:${data.telephone}` : null,
				text: data.$contactText && data.$contactText.telephone || data.telephone || null,
			},
			{
				itemprop: 'email',
				icon: 'mail',
				href: (data.email) ? `mailto:${data.email}` : null,
				text: data.$contactText && data.$contactText.email || data.email || null,
			},
			{
				itemprop: 'url',
				icon: 'home',
				href: data.url || null,
				text: data.$contactText && data.$contactText.url || data.url || null,
			},
		]
		// BUG: upgrade to `extrajs-dom^5.1`, then remove manual type inference
		new xjs.HTMLUListElement(document.querySelector('main header address ul.c-Contact') as HTMLUListElement).populate(function (f, d: {
			itemprop : string;
			icon     : keyof octicons;
			href     : string|null;
			text     : string|null;
		}) {
			new xjs.HTMLAnchorElement(f.querySelector('.c-Contact__Link') as HTMLAnchorElement).href(d.href)
			new xjs.Element(f.querySelector('.c-Contact__Icon') !).innerHTML(octicons[d.icon].toSVG({
				width : octicons[d.icon].width  * 1.25, // NB{LINK} src/css/_c-Contact.less#L82 // `.c-Contact__Icon@--font-scale`
				height: octicons[d.icon].height * 1.25, // NB{LINK} src/css/_c-Contact.less#L82 // `.c-Contact__Icon@--font-scale`
			}))
			f.querySelector('.c-Contact__Link') !.setAttribute('itemprop', d.itemprop)
			f.querySelector('.c-Contact__Text') !.textContent = d.text
		}, dataset)
	})()

	document.querySelector('#about slot[name="about"]') !.textContent = data.description || ''
	new xjs.Element(document.querySelector('#edu .o-ListAchv') !).empty().append(
		...(data.$degrees || []).map((item) => xDegree.process(item))
	)

	// BUG: upgrade to `extrajs-dom^5.1`, then remove manual type inference
	new xjs.HTMLUListElement(document.querySelector('.o-Grid--skillGroups') as HTMLUListElement).populate(function (f, d: SkillGroup) {
		f.querySelector('.o-List__Item'    ) !.id          = `${d.identifier}-item` // TODO fix this after fixing hidden-ness
		f.querySelector('.c-Position'      ) !.id          = d.identifier
		f.querySelector('.c-Position__Name') !.textContent = d.name
		new xjs.Element(f.querySelector('.o-Grid--skill') !).empty().append(
			...d.itemListElement.map((item: Skill) => xSkill.process(item))
		)
	}, data.$skills || [])

	// BUG: upgrade to `extrajs-dom^5.1`, then remove manual type inference
	new xjs.HTMLUListElement(document.querySelector('#skills .o-List--print') as HTMLUListElement).populate(function (f, d: Element) {
		f.querySelector('li') !.innerHTML = d.innerHTML
	}, [...document.querySelector('.o-Grid--skillGroups') !.querySelectorAll('dt.o-Grid__Item')])

	;(() => {
		let templateEl: HTMLTemplateElement = document.querySelector('template#experience') as HTMLTemplateElement
		const xPositionGroup: Processor<JobPositionGroup, object> = new Processor(templateEl, function (frag, datagroup) {
			frag.querySelector('.o-Grid__Item--exp') !.id = datagroup.identifier
			frag.querySelector('.c-ExpHn') !.textContent = datagroup.name
			// BUG: upgrade to `extrajs-dom^5.1`, then remove manual type inference
			new xjs.HTMLUListElement(frag.querySelector('ul.o-List') as HTMLUListElement).populate(function (f, d: JobPosition) {
				new xjs.HTMLLIElement(f.querySelector('li') !).empty().append(xPosition.process(d))
			}, datagroup.itemListElement)
		})
		templateEl.after(...(data.$positions || []).map((group) => xPositionGroup.process(group)))
	})()

	;(() => {
		let templateEl: HTMLTemplateElement = document.querySelector('template#achievements') as HTMLTemplateElement
		function achievementGroupProcessorGenerator<T>(processor: Processor<T, object>): Processor<{
			name           : string;
			identifier     : string;
			itemListElement: T[];
		}, {
			classes?: string;
		}> {
			return new Processor(templateEl, function (frag, datagroup, optsgroup) {
				frag.querySelector('.o-Grid__Item--exp') !.id = datagroup.identifier
				frag.querySelector('.c-ExpHn') !.textContent = datagroup.name
				new xjs.HTMLDListElement(frag.querySelector('.o-ListAchv') as HTMLDListElement).empty()
					.replaceClassString('{{ classes }}', optsgroup.classes || '')
					.append(...datagroup.itemListElement.map((item) => processor.process(item)))
			})
		}
		templateEl.after(
			...[
				achievementGroupProcessorGenerator<Prodev>(xProdev).process({
					name           : 'Profes­sional Dev­elopment', // NOTE invisible soft hyphens here! // `Profes&shy;sional Dev&shy;elopment`
					identifier     : 'prof-dev',
					itemListElement: data.$prodevs || [],
				}),
				achievementGroupProcessorGenerator<Award>(xAward).process({
					name           : 'Awards & Member­ships', // NOTE `Awards &amp; Member&shy;ships`
					identifier     : 'awards',
					itemListElement: data.$awards || [],
				}),
				achievementGroupProcessorGenerator<Award>(xAward).process({
					name           : 'Team Athletic Experience',
					identifier     : 'athletic',
					itemListElement: data.$teams  || [],
				}, {
					classes: 'h-Hr',
				}),
			]
		)
	})()

	;(() => {
		new xjs.Element(document.body).append(...(opts.scripts || []).map((script) =>
			JSDOM.fragment(script).querySelector('script')
		))
	})()
}

export default async function (data: ResumePerson, opts?: OptsTypeResume): Promise<Document> {
	let ajv: Ajv.Ajv = new Ajv()
	ajv.addMetaSchema(await META_SCHEMATA).addSchema(await SCHEMATA)
	let is_data_valid: boolean = ajv.validate(RESUME_SCHEMA, data) as boolean
	if (!is_data_valid) {
		let e: TypeError & { filename?: string; details?: Ajv.ErrorObject } = new TypeError(ajv.errors ![0].message)
		e.filename = 'resume.json'
		e.details = ajv.errors ![0]
		console.error(e)
		throw e
	}
	// return Processor.processAsync(doc, instructions, data, opts) // TODO on template-processor^2
	await instructions(doc, data, opts || {})
	return doc
}
