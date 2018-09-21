import { CommonMessage, Header, Attachment } from './messages/commonMessage'
import { Constants } from './constants'
import { v4 as uuid } from 'uuid'

import Logger from './loggers/logger'

const logger = new Logger('client', 'bus-connection')

export type AttachmentDefinition = [Header[], string | object]
export type AttachmentObject = Attachment | AttachmentDefinition
export type HeaderDefinition = [string, string | object]
export type HeaderObject = Header | HeaderDefinition

/**
 * Display in the console a common message.
 *
 * @param counterpartIdKey Receiver's id key.
 * @param commonMessage Common message to display.
 */
export function displayCommonMessage(counterpartIdKey: string, commonMessage: CommonMessage): void {
	const currentIdKey = commonMessage.replyTo
	const log = logger.get(currentIdKey === counterpartIdKey ? 'response' : 'request', counterpartIdKey)

	log(JSON.stringify(commonMessage, null, 2))
}

/**
 * Get the value of a common message's header by key.
 *
 * @param commonMessage Common message received.
 * @param key Header's key.
 */
export function getHeaderValue(commonMessage: CommonMessage, key: string): string | object | null {
	const header = CommonMessage
		.fromObject(commonMessage.toJSON()).headers
		.find(header => header.key === key)

	if (!header) {
		logger.get('error')(`Header with key ${key} is not found!`)

		return null
	}

	return parse(header.value)
}

export function parseAttachment(attachments: AttachmentObject[]) {
	return attachments.map(attachment => attachment instanceof Attachment
		? attachment
		: createAttachment(attachment[0], stringify(attachment[1])))
}

export function parseHeaders(headers: HeaderObject[]) {
	return headers.map(header => header instanceof Header
		? header
		: createHeader(header[0], header[1]))
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

/**
 * Create a common message.
 *
 * @param senderId Sender's id.
 * @param receiverId Receiver's id.
 * @param headers Array of headers (each header's key must be unique).
 * @param attachments Array of attachments.
 */
export function createCommonMessage(senderId: string, receiverId: string, headers: Header[], attachments: Attachment[]): CommonMessage {
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
 * @param key The key of the header.
 * @param value The value of the header.
 */
export function createHeader(key: string, value: string | object): Header {
	const payload = {
		key,
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
export function createAttachment(headers: Header[], data: string): Attachment {
	const payload = { headers, data }
	const errorMessage = Attachment.verify(payload)

	if (errorMessage) throw new Error(`Unable to create an attachment : ${errorMessage}`)

	return new Attachment(payload)
}

export const BusConnection = {
	displayCommonMessage,
	getHeaderValue,
	parseAttachment,
	parseHeaders,
	createCommonMessage,
	createHeader,
	createAttachment
}
