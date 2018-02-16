const Service = require('../lib/service').default
const Constants = require('./permissions')
const test = require('ava')

const PermissionsManager = Service.PermissionsManager

test('Check if the user has a super permission (he has)', t => {
	t.is(PermissionsManager.checkIfUserIsSuperUser(Constants.PERMISSIONS_SET3), true)
})

test('Check if the user has a super permission (he has not) #1', t => {
	t.is(PermissionsManager.checkIfUserIsSuperUser(Constants.PERMISSIONS_SET4), false)
})

test('Check if the user has a super permission (he has not) #2', t => {
	t.is(PermissionsManager.checkIfUserIsSuperUser(Constants.PERMISSIONS_SET5), false)
})


test('Get the permissions from an instance (single instance)', t => {
	t.is(PermissionsManager.getPermissionsFromInstance(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET1), Constants.PERMISSIONS_SET2)
})

test('Get the permissions from an instance (several instances)', t => {
	t.is(PermissionsManager.getPermissionsFromInstance(Constants.INSTANCE_DEV, Constants.INSTANCE_SET2), Constants.PERMISSIONS_SET6)
	t.is(PermissionsManager.getPermissionsFromInstance(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET2), Constants.PERMISSIONS_SET2)
})

test('Get the permissions from a unexistant instance', t => {
	t.is(PermissionsManager.getPermissionsFromInstance(Constants.INSTANCE_SUPER, Constants.INSTANCE_SET2), null)
})

test('Get the permissions from an empty instance', t => {
	t.is(PermissionsManager.getPermissionsFromInstance('', Constants.INSTANCE_SET2), null)
})

test('Get the permissions from a set of null instance permission', t => {
	t.is(PermissionsManager.getPermissionsFromInstance(Constants.INSTANCE_ROXANE, null), null)
})


test('Merge two sets of permissions: user\'s permissions are null', t => {
	t.is(PermissionsManager.mergePermissions(null, Constants.PERMISSIONS_SET1), Constants.PERMISSIONS_SET1)
})

test('Merge two sets of permissions: admin\'s permissions are null', t => {
	t.deepEqual(PermissionsManager.mergePermissions(Constants.PERMISSIONS_SET1, null), Constants.PERMISSIONS_SET1)
})

test('Merge two sets of permissions: one is super admin', t => {
	t.is(PermissionsManager.mergePermissions(Constants.PERMISSIONS_SET1, Constants.PERMISSIONS_SET7), Constants.PERMISSIONS_SET7)
})

test('Merge two sets of permissions', t => {
	t.deepEqual(PermissionsManager.mergePermissions(Constants.PERMISSIONS_SET6, Constants.PERMISSIONS_SET8), Constants.PERMISSIONS_SET9)
})


test('Parse permissions: formatted permissions are invalid', t => {
	t.is(PermissionsManager.parsePermissions(null), null)
	t.is(PermissionsManager.parsePermissions('toto'), null)
})

test('Parse permissions: with no values', t => {
	t.deepEqual(PermissionsManager.parsePermissions([{ feature: 'reports', action: 'read' }]), { [Constants.REPORTS]: Constants.READ })

	t.deepEqual(
		PermissionsManager.parsePermissions([
			{ feature: 'reports', action: 'read' },
			{ feature: 'stripe', action: 'edit' }]
		),
		{ [Constants.REPORTS]: Constants.READ, [Constants.STRIPE]: Constants.EDIT }
	)
})

test('Parse permissions: with values', t => {
	t.deepEqual(
		PermissionsManager.parsePermissions([{ feature: 'reports', action: 'read', values: ['Report 1'] }]),
		{ [Constants.REPORTS]: Constants.READ_VALUE }
	)

	t.deepEqual(
		PermissionsManager.parsePermissions([
			{ feature: 'reports', action: 'read', values: ['Report 1'] },
			{ feature: 'stripe', action: 'edit' }
		]),
		{ [Constants.REPORTS]: Constants.READ_VALUE, [Constants.STRIPE]: Constants.EDIT }
	)
})


test('Check the permissions: with an invalid instance', t => {
	t.throws(() => PermissionsManager.hasPermissions(null, Constants.INSTANCE_SET1, Constants.FORMATTED_SET2))
	t.throws(() => PermissionsManager.hasAnyPermissions(null, Constants.INSTANCE_SET1, Constants.FORMATTED_SET2))
})

test('Check the permissions: the required permissions are null', t => {
	t.is(PermissionsManager.hasPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET1, null), false)
	t.is(PermissionsManager.hasAnyPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET1, null), false)
})

test('Check the permissions: the user\'s permissions are null', t => {
	t.is(PermissionsManager.hasPermissions(Constants.INSTANCE_ROXANE, null, Constants.FORMATTED_SET1), false)
	t.is(PermissionsManager.hasAnyPermissions(Constants.INSTANCE_ROXANE, null, Constants.FORMATTED_SET1), false)
})

test('Check the permissions: the user has the required permission #1', t => {
	t.is(PermissionsManager.hasPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET1, Constants.FORMATTED_SET2), true)
	t.is(PermissionsManager.hasAnyPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET1, Constants.FORMATTED_SET2), true)
})

test('Check the permissions: the user has the required permission #2', t => {
	t.is(PermissionsManager.hasPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET1, Constants.FORMATTED_SET1), true)
	t.is(PermissionsManager.hasAnyPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET1, Constants.FORMATTED_SET1), true)
})

test('Check the permissions: the user does\'nt have at all the required permissions #1', t => {
	t.is(PermissionsManager.hasPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET1, Constants.FORMATTED_SET8), false)
	t.is(PermissionsManager.hasAnyPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET1, Constants.FORMATTED_SET8), true)
})

test('Check the permissions: the user does\'nt have all the required permissions #2', t => {
	t.is(PermissionsManager.hasPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET1, Constants.FORMATTED_SET9), false)
	t.is(PermissionsManager.hasAnyPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET1, Constants.FORMATTED_SET9), true)
})

test('Check the permissions: the user has an admin permission for a service', t => {
	t.is(PermissionsManager.hasPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET4, Constants.FORMATTED_SET6), true)
	t.is(PermissionsManager.hasAnyPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET4, Constants.FORMATTED_SET6), true)
})

test('Check the permissions: the user is assigned on several instances and has the permissions', t => {
	t.is(PermissionsManager.hasPermissions(Constants.INSTANCE_SUPER, Constants.INSTANCE_SET3, Constants.FORMATTED_SET6), true)
	t.is(PermissionsManager.hasAnyPermissions(Constants.INSTANCE_SUPER, Constants.INSTANCE_SET3, Constants.FORMATTED_SET6), true)
})

test('Check the permissions: the user is assigned on several instances and has not the permissions', t => {
	t.is(PermissionsManager.hasPermissions(Constants.INSTANCE_DEV, Constants.INSTANCE_SET2, Constants.FORMATTED_SET10), false)
	t.is(PermissionsManager.hasAnyPermissions(Constants.INSTANCE_DEV, Constants.INSTANCE_SET2, Constants.FORMATTED_SET10), true)
})

test('Check the permissions: the user is assigned to several instances', t => {
	t.is(PermissionsManager.hasPermissions(Constants.INSTANCE_DEV, Constants.INSTANCE_SET2, Constants.FORMATTED_SET6), true)
	t.is(PermissionsManager.hasAnyPermissions(Constants.INSTANCE_DEV, Constants.INSTANCE_SET2, Constants.FORMATTED_SET6), true)
})

test('Check the permissions: the user is a super user on this instance', t => {
	t.is(PermissionsManager.hasPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET5, Constants.FORMATTED_SET8), true)
	t.is(PermissionsManager.hasAnyPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET5, Constants.FORMATTED_SET8), true)
})

test('Check the permissions: the user has permissions on the super instance', t => {
	t.is(PermissionsManager.hasPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET5, Constants.FORMATTED_SET8), true)
	t.is(PermissionsManager.hasAnyPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET5, Constants.FORMATTED_SET8), true)
})

test('Check the permissions: the user is a super user on the super instance', t => {
	t.is(PermissionsManager.hasPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET6, Constants.FORMATTED_SET5), true)
	t.is(PermissionsManager.hasAnyPermissions(Constants.INSTANCE_ROXANE, Constants.INSTANCE_SET6, Constants.FORMATTED_SET5), true)
})
