import * as Debug from 'debug'
import { Constants } from '../constants';

class Logger {
	scope: string[]

	constructor(...scope: string[]) {
		this.scope = scope
	}

	get(...keywords: string[]) {
		return Logger.generateLogger(...this.scope, ...keywords)
	}

 	static generateLogger(...keywords: string[]) {
		return Debug([Constants.PLATFORM6].concat(keywords).join(':'))
	}
}

export default Logger

