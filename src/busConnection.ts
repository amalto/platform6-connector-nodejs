import { CommonMessage, Header, Attachment } from './messages/commonMessage'
import { Constants } from './constants';
import { v4 as uuid } from 'uuid'

export type AttachmentDefinition = [Header[], string | object]
export type AttachmentObject = Attachment | AttachmentDefinition
export type HeaderDefinition = [string, string | object]
export type HeaderObject = Header | HeaderDefinition

export function getHeaderKey(serviceId: string, key: string): string {
	return Constants.HEADER_KEY_PREFIX + serviceId + Constants.SEPARATOR + key
}

export function displayCommonMessage(message: string, commonMessage: CommonMessage): void {
	console.log(`${message}:\n${JSON.stringify(commonMessage)}`)
}

export function getHeaderValue(commonMessage: CommonMessage, serviceId: string, key: string): string | object | null {
	const headerKey = getHeaderKey(serviceId, key)

	const header = CommonMessage
		.fromObject(commonMessage.toJSON()).headers
		.find(header => header.key === headerKey)

	if (!header) {
		console.log(`Header with key ${headerKey} is not found!`)

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
	static getHeaderKey = getHeaderKey
	static getHeaderValue = getHeaderValue
	static parseHeaders = parseHeaders
	static displayCommonMessage = displayCommonMessage

	static createCommonMessage(senderId: string, headers: Header[], attachments: Attachment[]): CommonMessage {
		const payload = { id: uuid(), replyTo: senderId, headers, attachments }
		const errorMessage = CommonMessage.verify(payload)

		if (errorMessage) throw new Error(`Unable to create a common message: ${errorMessage}`)

		return new CommonMessage(payload)
	}

	static createHeader(receiverId: string, key: string, value: string | object): Header {
		const payload = {
			key: receiverId ? getHeaderKey(receiverId, key) : key,
			value: stringify(value)
		}

		const errorMessage = Header.verify(payload)

		if (errorMessage) throw new Error(`Unable to create an header: ${errorMessage}`)

		return new Header(payload)
	}

	static createAttachment(headers: Header[], data: string): Attachment {
		const payload = { headers, data }
		const errorMessage = Attachment.verify(payload)

		if (errorMessage) throw new Error(`Unable to create an attachment : ${errorMessage}`)

		return new Attachment(payload)
	}
}
