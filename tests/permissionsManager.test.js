const Service = require('../lib/service').default
const test = require('ava')

const PermissionsManager = Service.PermissionsManager

const userPermissions = {
	"workflow": { "role": ["Invoice Payers"] },
	"home": { "*": {} },
	"reports": { "read": {} }
}

const requiredPermission = { "home": { "*": {} } }
const requiredPermissions1 = {
	"home": { "*": {} },
	"workflow": { "role": ["Invoice Payers"] },
}
const requiredPermissions2 = {
	"stripe": { "read": {} },
	"messages": { "*": {} }
}
const requiredPermissions3 = {
	"home": { "*": {} },
	"stripe": { "read": {} },
}

test('The required permissions are null', t => {
	t.is(PermissionsManager.hasPermissions(null, userPermissions), false)
})

test('The user\'s permissions are null', t => {
	t.is(PermissionsManager.hasPermissions(requiredPermissions1, null), false)
})

test('The user has the required permission', t => {
	t.is(PermissionsManager.hasPermissions(requiredPermissions1, userPermissions), true)
})

test('The user has the required permissions', t => {
	t.is(PermissionsManager.hasPermissions(requiredPermissions1, userPermissions), true)
})

test('The user does not have the required permission', t => {
	t.is(PermissionsManager.hasPermissions({ "scripts": { "read": {} } }, userPermissions), false)
})

test('The user does not have the required permissions', t => {
	t.is(PermissionsManager.hasPermissions(requiredPermissions2, userPermissions), false)
})

test('The user has an admin permission for a service', t => {
	t.is(PermissionsManager.hasPermissions({ "home": { "read": {} } }, userPermissions), true)
})

test('The user has at least one of the required permissions', t => {
	t.is(PermissionsManager.hasAnyPermissions(requiredPermissions3, userPermissions), true)
})

test('The user has not at least one of the required permissions', t => {
	t.is(PermissionsManager.hasAnyPermissions(requiredPermissions2, userPermissions), false)
})
