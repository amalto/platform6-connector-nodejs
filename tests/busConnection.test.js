import test from 'ava'
import debug from 'debug'

const BusConnection = require('../src/busConnection')
const Constants = require('../src/constants')

const DEMO_TYPESCRIPT = 'demo.typescript'
const PLATFORM6_SCRIPTS = 'platform6.scripts'

test('Create a header with a correct payload', t => {
	const header = BusConnection.createHeader('key1', 'value1')

	t.truthy(header)
	t.is(typeof header, 'object')
	t.snapshot(header)
})

test('Create a header with an undefined value', t => {
	const header = BusConnection.createHeader('key1')

	t.truthy(header)
	t.is(typeof header, 'object')
	t.snapshot(header)
})

test('Prevent from creating a header with an incorrect payload', t => {
	t.throws(() => BusConnection.createHeader({}, 'value1'))
})

test('Create an attachment with a correct payload', t => {
	const headers = BusConnection.parseHeaders([['key1', 'value1'], ['key2', 'value2']])
	const attachment = BusConnection.createAttachment(headers, 'attachment1')

	t.truthy(attachment)
	t.is(typeof attachment, 'object')
	t.snapshot(attachment)
})

test('Prevent from creating an attachment with an incorrect payload', t => {
	const headers = BusConnection.parseHeaders([['key1', 'value1'], ['key2', 'value2']])
	t.throws(() => BusConnection.createAttachment(headers, {}))
})

test('Parse successfully headers', t => {
	const headers = BusConnection.parseHeaders([ ['key1', 'value1'], ['key2', 'value2'] ])

	t.truthy(headers)
	t.true(Array.isArray(headers))
	t.is(headers.length, 2)
	t.snapshot(headers)
})

test('Parse successfully attachments', t => {
	const headers = BusConnection.parseHeaders([['key1', 'value1'], ['key2', 'value2']])
	const attachments = BusConnection.parseAttachment([[headers, 'attachment1'], [headers, 'attachment2']])

	t.truthy(attachments)
	t.true(Array.isArray(attachments))
	t.is(attachments.length, 2)
	t.snapshot(attachments)
})

test('Create a common message with a correct payload (new exchange)', t => {
	const headers = BusConnection.parseHeaders([ ['key1', 'value1'], ['key2', 'value2'] ])
	const commonMessage = BusConnection.createCommonMessage(DEMO_TYPESCRIPT, PLATFORM6_SCRIPTS, headers, [])

	t.truthy(commonMessage)

	// The randomly generated id breaks the test
	commonMessage.id = '1234'

	t.snapshot(commonMessage)
})

test('Create a common message with a correct payload (response)', t => {
	const headers = BusConnection.parseHeaders([ ['key1', 'value1'], ['key2', 'value2'] ])
	const commonMessage = BusConnection.createCommonMessage(DEMO_TYPESCRIPT, PLATFORM6_SCRIPTS, headers, [], '1234')

	t.truthy(commonMessage)
	t.snapshot(commonMessage)
})

test('Prevent from creating a common message with incorrect headers', t => {
	t.throws(() => BusConnection.createCommonMessage(DEMO_TYPESCRIPT, PLATFORM6_SCRIPTS, {}, []))
})

test('Prevent from creating a common message with an no payload', t => {
	t.throws(() => BusConnection.createCommonMessage())
})

test('Prevent from creating a common message with two headers having the same key', t => {
	const headers = BusConnection.parseHeaders([['key1', 'value1'], ['key1', 'value2']])
	t.throws(() => BusConnection.createCommonMessage(DEMO_TYPESCRIPT, PLATFORM6_SCRIPTS, headers, []))
})

test('Get a header\'s value with a correct key', t => testGettingHeaderKey(t, 'key2', 'value2'))

test('Fails getting a header\'s value with an unexisting key', t => testGettingHeaderKey(t, 'key3', null))

test('Fails getting a a header\'s value of an incorrect key', t => testGettingHeaderKey(t, {}, null))

function testGettingHeaderKey(t, expectedKey, result) {
	const headers = BusConnection.parseHeaders([['key1', 'value1'], ['key2', 'value2']])
	const commonMessage = BusConnection.createCommonMessage(DEMO_TYPESCRIPT, PLATFORM6_SCRIPTS, headers, [])

	// const oldDebugLog = debug.log
	// debug.enable(`${Constants.PLATFORM6}:*`)

	// // Truncate the date from the log output
	// debug.log = message => t.snapshot(message.split(' ').slice(1).join(' '))

	t.is(BusConnection.getHeaderValue(commonMessage, expectedKey), result)

	// debug.log = oldDebugLog)
}

test.skip('Display a common message request', t => testDisplayingCommonMessage(PLATFORM6_SCRIPTS, DEMO_TYPESCRIPT, t))
test.skip('Display a common message response', t => testDisplayingCommonMessage('service1', 'service2', t))

function testDisplayingCommonMessage(destinationId, senderId, t) {
	const commonMessage = BusConnection.createCommonMessage(destinationId, senderId, [], [])
	const oldDebugLog = debug.log

	// The randomly generated id breaks the test
	commonMessage.id = '1234'

	debug.enable(`${Constants.PLATFORM6}:*`)

	// Truncate the date from the log output
	debug.log = message => t.snapshot(message.split(' ').slice(1).join(' '))

	BusConnection.displayCommonMessage(destinationId, commonMessage)
	debug.log = oldDebugLog
}
