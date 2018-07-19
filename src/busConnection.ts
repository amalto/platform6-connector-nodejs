import { CommonMessage, Header, Attachment } from './messages/commonMessage'
import { Constants } from './constants'
import { Logger } from './loggers/logger'
import { v4 as uuid } from 'uuid'

const logger = new Logger('client', 'bus-connection')

export type AttachmentDefinition = [Header[], string | object]
export type AttachmentObject = Attachment | AttachmentDefinition
export type HeaderDefinition = [string, string | object]
export type HeaderObject = Header | HeaderDefinition

/**
 * Format a common message header's key.
 *
 * @param serviceId Receiver's id.
 * @param key Header's key.
 */
export function formatHeaderKey(serviceId: string, key: string): string {
	return serviceId + Constants.ID_SEPARATOR + key
}

/**
 * Display in the console a common message.
 *
 * @param counterpartIdKey Receiver's id key.
 * @param commonMessage Common message to display.
 */
export function displayCommonMessage(counterpartIdKey: string, commonMessage: CommonMessage): void {
	const currentIdKey = commonMessage.replyTo
	const counterpartId = counterpartIdKey.split(Constants.ID_SEPARATOR).slice(1).join(Constants.ID_SEPARATOR)
	const log = logger.get(currentIdKey === counterpartIdKey ? 'response' : 'request', counterpartIdKey)

	log(JSON.stringify(commonMessage, null, 2))
}

/**
 * Get the value of a common message's header by key.
 *
 * @param commonMessage Common message received.
 * @param serviceId Sender's id.
 * @param key Header's key.
 */
export function getHeaderValue(commonMessage: CommonMessage, serviceId: string, key: string): string | object | null {
	const headerKey = formatHeaderKey(serviceId, key)

	const header = CommonMessage
		.fromObject(commonMessage.toJSON()).headers
		.find(header => header.key === headerKey)

	if (!header) {
		logger.get('error')(`Header with key ${headerKey} is not found!`)

		return null
	}

	return parse(header.value)
}

export function parseAttachment(attachments: AttachmentObject[]) {
	return attachments.map(attachment => attachment instanceof Attachment
		? attachment
		: BusConnection.createAttachment(attachment[0], stringify(attachment[1])))
}

export function parseHeaders(receiverId: string, headers: HeaderObject[]) {
	return headers.map(header => header instanceof Header
		? header
		: BusConnection.createHeader(receiverId, header[0], header[1]))
}

function parse(value: string) {
	try {
		return JSON.parse(value)
	} catch (_) {
		return value
	}
}

function stringify(value: string | object) {
	return typeof value === 'string' ? value : JSON.stringify(value)
}

export class BusConnection {
	static formatHeaderKey = formatHeaderKey
	static getHeaderValue = getHeaderValue
	static parseHeaders = parseHeaders
	static displayCommonMessage = displayCommonMessage

	/**
	 * Create a common message.
	 *
	 * @param senderId Sender's id.
	 * @param receiverId Receiver's id.
	 * @param headers Array of headers (each header's key must be unique).
	 * @param attachments Array of attachments.
	 */
	static createCommonMessage(senderId: string, receiverId: string, headers: Header[], attachments: Attachment[]): CommonMessage {
		const keys = headers.map(h => h.key)
		if (keys.some((key, index) => keys.indexOf(key) !== index))
			throw new Error(`Unable to create a common message: some headers' keys are not unique.`)

		const payload = { id: uuid(), destination: Constants.RECEIVER_ID_PREFIX + receiverId, replyTo: senderId, headers, attachments }
		const errorMessage = CommonMessage.verify(payload)

		if (errorMessage) throw new Error(`Unable to create a common message: ${errorMessage}`)

		return new CommonMessage(payload)
	}

	/**
	 * Create a common message's header
	 *
	 * @param receiverId Receiver's id.
	 * @param key The key of the header.
	 * @param value The value of the header.
	 */
	static createHeader(receiverId: string, key: string, value: string | object): Header {
		const payload = {
			key: receiverId ? formatHeaderKey(receiverId, key) : key,
			value: stringify(value)
		}

		const errorMessage = Header.verify(payload)

		if (errorMessage) throw new Error(`Unable to create a header: ${errorMessage}`)

		return new Header(payload)
	}

	/**
	 * Create a common message's attachment.
	 *
	 * @param headers Array of headers.
	 * @param data The value of the attachment.
	 */
	static createAttachment(headers: Header[], data: string): Attachment {
		const payload = { headers, data }
		const errorMessage = Attachment.verify(payload)

		if (errorMessage) throw new Error(`Unable to create an attachment : ${errorMessage}`)

		return new Attachment(payload)
	}
}
