const Service = require('../lib/service').default
const test = require('ava')

const PermissionsManager = Service.PermissionsManager

const userPermissions = {
	"*": { "workflow": { "role": ["Invoice Payers"] }, "home": { "*": {} } },
	"Roxane": { "orgs": { "read": {} }, "reports": { "*": {} } }
}

// test('The user tests a permission null', t => {
// 	t.is(PermissionsManager.hasPermission('Roxane', null, userPermissions), false)
// })

// test('The user has the required permission', t => {
// 	t.is(PermissionsManager.hasPermission('Roxane', { "orgs": { "read": {} } }, userPermissions), true)
// })

// test('The user does not have the required permission', t => {
// 	t.is(PermissionsManager.hasPermission('Roxane', { "scripts": { "read": {} } }, userPermissions), false)
// })

// test('The user tests a set of permissions null', t => {
// 	t.is(PermissionsManager.hasAnyPermission('Roxane', null, userPermissions), false)
// })

// test('The user has at least one of the required permissions #1', t => {
// 	t.is(PermissionsManager.hasAnyPermission('Roxane', { "orgs": { "read": {} }, "scripts": { "*": {} } }, userPermissions), true)
// })

// test('The user has at least one of the required permissions #2', t => {
// 	t.is(PermissionsManager.hasAnyPermission('Roxane', { "scripts": { "*": {} }, "orgs": { "read": {} } }, userPermissions), true)
// })

// test('The user has all the required permissions', t => {
// 	t.is(PermissionsManager.hasAnyPermission('Roxane', { "orgs": { "read": {} }, "reports": { "*": {} } }, userPermissions), true)
// })

test('The user has neither required permission', t => {
	t.is(PermissionsManager.hasAnyPermission('*', { "scripts": { "read": {} }, "stripe": { "read": {} } }, userPermissions), false)
})

// test('The user has an admin permission for a service', t => {
// 	t.is(PermissionsManager.hasPermission('Roxane', { "reports": { "read": {} } }, userPermissions), true)
// })

