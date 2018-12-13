import * as path from 'path'

import * as xjs from 'extrajs-dom'

import * as Ajv from 'ajv'
import {xPersonFullname} from 'aria-patterns'
import {Processor} from 'template-processor'

const { SCHEMATA } = require('schemaorg-jsd')
const requireOther = require('schemaorg-jsd/lib/requireOther.js')

const RESUME_SCHEMA = requireOther(path.join(__dirname, '../resume.jsd'))

import xAward    from './tpl/x-award.tpl'
import xDegree   from './tpl/x-degree.tpl'
import xPosition from './tpl/x-position.tpl'
import xProdev   from './tpl/x-prodev.tpl'
import xSkill    from './tpl/x-skill.tpl'


const doc: Document = xjs.Document.fromFileSync(path.join(__dirname, './resume.doc.html')).importLinks(__dirname).node

async function instructions(document: Document, data: any, opts: object): Promise<void> {
	new xjs.HTMLElement(document.querySelector('main header [itemprop="name"]') as HTMLElement).empty().append(
		xPersonFullname.process({
			familyName      : data.familyName      || '',
			givenName       : data.givenName       || '',
			additionalName  : data.additionalName  || '',
			honorificPrefix : data.honorificPrefix || '',
			honorificSuffix : data.honorificSuffix || '',
		})
	)

	new xjs.HTMLUListElement(document.querySelector('main header address ul.c-Contact')).populate(function (f, d) {
		new xjs.HTMLAnchorElement(f.querySelector('.c-Contact__Link')).href(d.href || null)
		f.querySelector('.c-Contact__Link').setAttribute('itemprop', d.name)
		f.querySelector('.c-Contact__Icon').className = f.querySelector('.c-Contact__Icon').className.replace('{{ octicon }}', d.icon)
		f.querySelector('.c-Contact__Text').textContent = d.text
	}, [
		{
			name: 'telephone',
			href: (data.telephone) ? `tel:${data.telephone}` : '',
			icon: 'device-mobile',
			text: data.$contactTitles.telephone || data.telephone,
		},
		{
			name: 'email',
			href: (data.email) ? `mailto:${data.email}` : '',
			icon: 'mail',
			text: data.$contactTitles.email || data.email,
		},
		{
			name: 'url',
			href: data.url || '',
			icon: 'home',
			text: data.$contactTitles.url || data.url,
		},
	])

	document.querySelector('#about slot[name="about"]').textContent = data.description || ''
	new xjs.HTMLDListElement(document.querySelector('#edu .o-ListAchv')).empty().append(
		new xjs.DocumentFragment(document.createDocumentFragment()).append(
			...(data.$degrees || []).map((item) => xDegree.process(item))
		)
	)

	new xjs.HTMLUListElement(document.querySelector('.o-Grid--skillGroups')).populate(function (f, d) {
		f.querySelector('.o-List__Item'    ).id          = `${d.identifier}-item` // TODO fix this after fixing hidden-ness
		f.querySelector('.c-Position'      ).id          = d.identifier
		f.querySelector('.c-Position__Name').textContent = d.name
		new xjs.HTMLDListElement(f.querySelector('.o-Grid--skill')).empty().append(
			...d.itemListElement.map((item) => xSkill.process(item))
		)
	}, data.$skills || [])
	new xjs.HTMLUListElement(document.querySelector('#skills .o-List--print')).populate(function (f, d) {
		f.querySelector('li').innerHTML = d.innerHTML
	}, [...document.querySelector('.o-Grid--skillGroups').querySelectorAll('dt.o-Grid__Item')])

	;(() => {
		let templateEl = document.querySelector('template#experience')
		const xPositionGroup = new Processor(templateEl, function (f, d) {
			f.querySelector('.o-Grid__Item--exp').id = d.identifier
			f.querySelector('.c-ExpHn').textContent = d.name
			new xjs.HTMLUListElement(f.querySelector('ul.o-List')).populate(function (f, d, o) {
				new xjs.HTMLLIElement(f.querySelector('li')).empty().append(xPosition.process(d))
			}, d.itemListElement)
		})
		templateEl.after(
			new xjs.DocumentFragment(document.createDocumentFragment())
				.append(...(data.$positions || []).map((group) => xPositionGroup.process(group)))
				.node
		)
	})()

	;(() => {
		let templateEl = document.querySelector('template#achievements')
		const xAchivementGroup = new Processor(templateEl, function (f, d) {
			f.querySelector('.o-Grid__Item--exp').id = d.id
			f.querySelector('.c-ExpHn').textContent = d.title
			new xjs.HTMLDListElement(f.querySelector('.o-ListAchv')).empty()
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

export default async function (data: any, opts?: object, this_arg?: unknown): Promise<Document> {
	let ajv = new Ajv()
	ajv.addSchema(SCHEMATA)
	let is_data_valid = ajv.validate(RESUME_SCHEMA, data)
	if (!is_data_valid) {
		let e = new TypeError(ajv.errors[0].message)
		e.filename = 'resume.json'
		e.details = ajv.errors[0]
		console.error(e)
		throw e
	}
	return Processor.processAsync(doc, instructions, data, opts, this_arg)
}
