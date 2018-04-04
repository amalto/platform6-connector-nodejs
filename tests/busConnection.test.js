const Service = require('../lib/service').default
const test = require('ava')
const debug = require('debug')

const BusConnection = Service.BusConnection
const Constants = Service.Constants

const serviceId = 'service_id'
const receiverId = 'receiver_id'
const headerKey = 'header_key'
const headerValue = 'header_value'
const headers = BusConnection.parseHeaders(serviceId, [
	['key1', 'value1'],
	['key1.1', 'value1.1'],
	['key2', 'value2']
])
const attachmentValue = 'attachment_value'
const commonMessageId = 'common_message_id'

test('Format a header\'s key', t => t.snapshot(BusConnection.formatHeaderKey(serviceId, 'action')))

test.skip('Create a header with a receiver id', t => t.snapshot(BusConnection.createHeader('receiver_id', headerKey, headerValue)))
test.skip('Create a header without receiver id', t => t.snapshot(BusConnection.createHeader(null, headerKey, headerValue)))
test('Prevent from creating a header with an incorrect payload', t => t.throws(() => BusConnection.createHeader(null, {}, headerValue)))

test.skip('Create an attachment with a correct payload', t => t.snapshot(BusConnection.createAttachment(headers, attachmentValue)))
test('Prevent from creating an attachment with an incorrect payload', t => t.throws(() => BusConnection.createAttachment(headers, {})))

test.todo('parseAttachment')
test.todo('parseHeaders')
test.todo('Prevent from parsing an array of headers having same keys')

test.skip('Create a common message with a correct payload', t => {
	const commonMessage = BusConnection.createCommonMessage('sender_id', headers, [BusConnection.createAttachment(headers, attachmentValue)])

	// The randomly generated id breaks the test
	commonMessage.id = commonMessageId
	t.snapshot(commonMessage)
})
test('Prevent from creating a common message with an incorrect payload', t => {
	t.throws(() => BusConnection.createCommonMessage('sender_id', headers, BusConnection.createAttachment(headers, attachmentValue)))
})
test('Prevent from creating a common message with two headers having the same key', t => {
	t.throws(() => BusConnection.createCommonMessage(
		'sender_id',
		'receiver_id',
		[
			BusConnection.createHeader(receiverId, headerKey, 'value1'),
			BusConnection.createHeader(receiverId, headerKey, 'value2')
		],
		[BusConnection.createAttachment(headers, attachmentValue)])
	)
})

test('Get a header\'s value with correct key', t => testGetHeaderValue(t, 'key1', 'value1'))
test('Get a header\'s value with incorrect key', t => testGetHeaderValue(t, 'key4', null))

test('Display a common message request', t => testDisplayCommonMessage('service2', 'service1', t))
test('Display a common message response', t => testDisplayCommonMessage('service1', 'service2', t))

function testDisplayCommonMessage(replyTo, destination, t) {
	const commonMessage = BusConnection.createCommonMessage(replyTo, destination, [], [])
	const oldDebugLog = debug.log

	// The randomly generated id breaks the test
	commonMessage.id = commonMessageId
	debug.enable(`${Constants.PLATFORM6}:*`)
	// Truncate the date from the log output
	debug.log = message => t.snapshot(message.split(' ').slice(1).join(' '))
	BusConnection.displayCommonMessage('service1', commonMessage)
	debug.log = oldDebugLog
}

function testGetHeaderValue(t, requestedKey, expected) {
	const commonMessage = BusConnection.createCommonMessage(serviceId, receiverId, headers, [])
	const oldDebugLog = debug.log

	debug.enable(`${Constants.PLATFORM6}:*`)
	// Truncate the date from the log output
	debug.log = message => t.snapshot(message.split(' ').slice(1).join(' '))
	t.is(BusConnection.getHeaderValue(commonMessage, serviceId, requestedKey), expected)
	debug.log = oldDebugLog
}
