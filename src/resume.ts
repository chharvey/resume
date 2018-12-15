import * as path from 'path'

import * as xjs from 'extrajs-dom'

import * as Ajv from 'ajv'
import {xPersonFullname} from 'aria-patterns'
import {Processor} from 'template-processor'

const { SCHEMATA } = require('schemaorg-jsd')
const requireOther = require('schemaorg-jsd/lib/requireOther.js')

const RESUME_SCHEMA = requireOther(path.join(__dirname, '../resume.jsd'))

import {ResumePerson, SkillGroup, JobPositionGroup, Skill, JobPosition} from './interfaces'
import xAward    from './tpl/x-award.tpl'
import xDegree   from './tpl/x-degree.tpl'
import xPosition from './tpl/x-position.tpl'
import xProdev   from './tpl/x-prodev.tpl'
import xSkill    from './tpl/x-skill.tpl'


const doc: Document = xjs.Document.fromFileSync(path.join(__dirname, './resume.doc.html')).importLinks(__dirname).node

async function instructions(document: Document, data: ResumePerson): Promise<void> {
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
			icon     : string;
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
			icon     : string;
			href     : string|null;
			text     : string|null;
		}) {
			new xjs.HTMLAnchorElement(f.querySelector('.c-Contact__Link') as HTMLAnchorElement).href(d.href)
			new xjs.Element(f.querySelector('.c-Contact__Icon') !).replaceClassString('{{ octicon }}', d.icon)
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
		const xAchivementGroup: Processor<unknown, object> = new Processor(templateEl, function (f, d) {
			f.querySelector('.o-Grid__Item--exp') !.id = d.id
			f.querySelector('.c-ExpHn') !.textContent = d.title
			new xjs.HTMLDListElement(f.querySelector('.o-ListAchv') as HTMLDListElement).empty()
				.replaceClassString('{{ classes }}', d.classes || '')
				.append(
					...d.list.map((item) => d.xComponent.process(item))
				)
		})
		templateEl.after(
			new xjs.DocumentFragment(document.createDocumentFragment())
				.append(...[
					{
						title  : 'Profes­sional Dev­elopment', // NOTE invisible soft hyphens here! // `Profes&shy;sional Dev&shy;elopment`
						id     : 'prof-dev',
						list   : data.$prodevs || [],
						xComponent: xProdev,
					},
					{
						title  : 'Awards & Member­ships', // NOTE `Awards &amp; Member&shy;ships`
						id     : 'awards',
						list   : data.$awards || [],
						xComponent: xAward,
					},
					{
						title  : 'Team Athletic Experience',
						id     : 'athletic',
						classes: 'h-Hr',
						list   : data.$teams  || [],
						xComponent: xAward,
					}
				].map((group) => xAchivementGroup.process(group)))
				.node
		)
	})()
}

export default async function (data: any): Promise<Document> {
	let ajv: Ajv.Ajv = new Ajv()
	ajv.addSchema(SCHEMATA)
	let is_data_valid: boolean = ajv.validate(RESUME_SCHEMA, data) as boolean
	if (!is_data_valid) {
		let e: TypeError & { filename?: string; details?: Ajv.ErrorObject } = new TypeError(ajv.errors ![0].message)
		e.filename = 'resume.json'
		e.details = ajv.errors ![0]
		console.error(e)
		throw e
	}
	// return Processor.processAsync(doc, instructions, data) // TODO on template-processor^2
	await instructions(doc, data)
	return doc
}
