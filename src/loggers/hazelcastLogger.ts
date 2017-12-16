import { LogLevel, ILogger } from 'hazelcast-client/lib/logging/LoggingService'
import Logger from './logger'

function camelToKebab(camelCased: string): string {
	return camelCased.match(/[A-Z]+[a-z]*/g).join('-').toLocaleLowerCase()
}

class HazelcastLogger implements ILogger {
	Logger = new Logger('hazelcast')

	log(level: LogLevel, className: string, message: string, furtherInfo: any) {
		return this.Logger.get(camelToKebab(className), LogLevel[level].toLocaleLowerCase())(message, furtherInfo)
	}
}

export default HazelcastLogger
