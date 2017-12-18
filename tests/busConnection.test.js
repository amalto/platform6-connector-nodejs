const Service = require('../lib/service').default
const test = require('ava')
const debug = require('debug')

const BusConnection = Service.BusConnection
const Constants = Service.Constants

test.todo('parseAttachment')
test.todo('parseHeaders')
test.todo('createHeader')
test.todo('createAttachment')
test.todo('createCommonMessage')

test('Format a header\'s key', t => t.snapshot(BusConnection.formatHeaderKey('service_id', 'action')))

test('Get a header\'s value with correct key', t => testGetHeaderValue(t, 'key1', 'value1'))
test('Get a header\'s value with incorrect key', t => testGetHeaderValue(t, 'key4', null))

test('Display a common message request', t => testDisplayCommonMessage('service2', t))
test('Display a common message response', t => testDisplayCommonMessage('service1', t))

function testDisplayCommonMessage(replyTo, t) {
	const commonMessage = BusConnection.createCommonMessage(replyTo, [], [])
	const oldDebugLog = debug.log

	// The randomly generated id breaks the test
	commonMessage.id = 'some-test-id'
	debug.enable(`${Constants.PLATFORM6}:*`)
	// Truncate the date from the log output
	debug.log = message => t.snapshot(message.split(' ').slice(1).join(' '))
	BusConnection.displayCommonMessage('service1', commonMessage)
	debug.log = oldDebugLog
}

function testGetHeaderValue(t, requestedKey, expected) {
	const serviceId = 'service_id'
	const headers = BusConnection.parseHeaders(serviceId, [
		['key1', 'value1'],
		['key1', 'value1.1'],
		['key2', 'value2']
	])
	const commonMessage = BusConnection.createCommonMessage(serviceId, headers, [])
	const oldDebugLog = debug.log

	debug.enable(`${Constants.PLATFORM6}:*`)
	// Truncate the date from the log output
	debug.log = message => t.snapshot(message.split(' ').slice(1).join(' '))
	t.is(BusConnection.getHeaderValue(commonMessage, serviceId, requestedKey), expected)
	debug.log = oldDebugLog
}
