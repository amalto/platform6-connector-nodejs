import * as Debug from 'debug'
import * as memoize from 'mem'
import { Constants } from '../constants';

export class Logger {
	scope: string[]

	constructor(...scope: string[]) {
		this.scope = scope
	}

	get(...keywords: string[]) {
		return Logger.getLogger(...this.scope, ...keywords)
	}

	static getLogger = memoize(Logger.generateLogger)

 	static generateLogger(...keywords: string[]) {
		return Debug([Constants.PLATFORM6].concat(keywords).join(':'))
	}
}

export default Logger

