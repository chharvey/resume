import * as sdo from 'schemaorg-jsd/dist/schemaorg' // TODO use an index file


export interface ResumePerson extends sdo.Person {
	/**
	 * @default ''
	 */
	description?: string;
	/** optional alternative texts to display */
	$contactText?: {
		/** optional alternative text of the url */
		url?: string;
		/** optional alternative text of the email */
		email?: string;
		/** optional alternative text of the telephone */
		telephone?: string;
	};
	/** List of skills, grouped by category. */
	$skills?: SkillGroup[];
	/** List of positions, grouped by category. */
	$positions?: JobPositionGroup[];
	/** List of degrees. */
	$degrees?: Degree[];
	/** List of professional development hours. */
	$prodevs?: Prodev[];
	/** List of other awards & memberships. */
	$awards?: Award[];
	/** List of athletic team memberships. */
	$teams?: Award[];
}

export interface SkillGroup extends sdo.ItemList {
	name: string;
	identifier: string;
	itemListElement: Skill[];
}

export interface JobPositionGroup extends sdo.ItemList {
	name: string;
	identifier: string;
	itemListElement: JobPosition[];
}

export interface Skill extends sdo.Rating {
	name: string;
	/** proficiency with this skill */
	ratingValue: number; // TODO use extrajs-types/Fraction
	worstRating?: 0;
	bestRating ?: 1;
}

export interface JobPosition extends sdo.JobPosting {
	identifier: string;
	title: string;
	hiringOrganization: sdo.Organization & {
		'@type': string;
		name: string;
	};
	jobLocation: ResumeCity;
	/** @override */
	responsibilities?: string[];
	/** the start date of the job position */
	$start: string;
	/** the end date of the job position */
	$end?: string;
}

export interface Degree {
	/** year the degree was earned. if not yet earned, a negative integer */
	year: number; // bigint
	/** grade-point-average */
	gpa: number;
	/** type and field of the degree */
	field: string;
}

export interface Prodev extends sdo.Event {
	'@type': string;
	name: string;
	startDate: string;
	endDate: string;
	location: ResumeCity;
	/** the number of professional development hours */
	$pdh: number;
}

export interface Award {
	/** date(s) relevant to the award */
	dates: string;
	/** custom HTML string defining this award */
	text: string;
	/** any sub-awards associated with this award */
	sub_awards?: Award[]
}

export interface ResumeCity extends sdo.City {
	address: sdo.PostalAddress & {
		addressLocality: string;
		addressRegion  : string;
	};
	geo: sdo.GeoCoordinates & {
		latitude: number;
		longitude: number;
	};
}
