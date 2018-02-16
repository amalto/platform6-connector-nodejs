/** ACTIONS */
const ADMIN 			= { '*': {} }
const EDIT 				= { 'edit': {} }
const READ 				= { 'read': {} }
const READ_VALUE 		= { 'read': ['Report 1'] }
const ROLE 				= { 'role': ['Invoice Payers'] }

/** FEATURES */
const HOME				= 'home'
const MESSAGES 			= 'messages'
const REPORTS 			= 'reports'
const SCRIPTS			= 'scripts'
const STRIPE 			= 'stripe'
const SUPER 			= '*'
const WORKFLOW			= 'workflow'

/** INSTANCES */
const INSTANCE_DEV		= 'dev'
const INSTANCE_ROXANE 	= 'Roxane'

const PERMISSIONS_SET1 = {
	[HOME]: ADMIN,
	[WORKFLOW]: ROLE
}
const FORMATTED_SET1 = [
	{ feature: HOME, action: '*' },
	{ feature: WORKFLOW, action: 'role', values: ['Invoice Payers'] }
]

const PERMISSIONS_SET2 = {
	[HOME]: ADMIN,
	[REPORTS]: READ,
	[WORKFLOW]: ROLE
}
const FORMATTED_SET2 = [
	{ feature: HOME, action: '*' },
	{ feature: REPORTS, action: 'read' },
	{ feature: WORKFLOW, action: 'role', values: ['Invoice Payers'] }
]

const PERMISSIONS_SET3 = {
	[REPORTS]: READ,
	[SCRIPTS]: ADMIN,
	[SUPER]: ADMIN
}
const PERMISSIONS_SET4 = {
	[REPORTS]: READ,
	[SCRIPTS]: ADMIN,
	[SUPER]: READ
}

const PERMISSIONS_SET5 = {
	[MESSAGES]: ADMIN,
	[STRIPE]: READ
}
const FORMATTED_SET5 = [
	{ feature: MESSAGES, action: '*' },
	{ feature: STRIPE, action: 'read' }
]

const PERMISSIONS_SET6 = {
	[HOME]: ADMIN,
	[STRIPE]: READ
}
const FORMATTED_SET6 = [
	{ feature: HOME, action: '*' },
	{ feature: STRIPE, action: 'read' }
]

const PERMISSIONS_SET7 = {
	[SUPER]: ADMIN
}

const PERMISSIONS_SET8 = {
	[HOME]: READ,
	[MESSAGES]: READ
}
const FORMATTED_SET8 = [
	{ feature: HOME, action: 'read' },
	{ feature: MESSAGES, action: 'read' }
]

const PERMISSIONS_SET9 = {
	[HOME]: ADMIN,
	[MESSAGES]: READ,
	[STRIPE]: READ
}
const FORMATTED_SET9 = [
	{ feature: HOME, action: '*' },
	{ feature: MESSAGES, action: 'read' },
	{ feature: STRIPE, action: 'read' }
]

const PERMISSIONS_SET10 = {
	[HOME]: ADMIN,
	[STRIPE]: ADMIN
}
const FORMATTED_SET10 = [
	{ feature: HOME, action: '*' },
	{ feature: STRIPE, action: '*' }
]

const INSTANCE_SET1 = {
	[INSTANCE_ROXANE]: PERMISSIONS_SET2
}
const INSTANCE_SET2 = {
	[INSTANCE_ROXANE]: PERMISSIONS_SET2,
	[INSTANCE_DEV]: PERMISSIONS_SET6
}
const INSTANCE_SET3 = {
	[INSTANCE_ROXANE]: PERMISSIONS_SET10
}
const INSTANCE_SET4 = {
	[INSTANCE_ROXANE]: PERMISSIONS_SET7
}

module.exports = {
	ADMIN,
	EDIT,
	READ,
	READ_VALUE,
	ROLE,
	HOME,
	MESSAGES,
	REPORTS,
	SCRIPTS,
	STRIPE,
	SUPER,
	WORKFLOW,
	INSTANCE_DEV,
	INSTANCE_ROXANE,
	PERMISSIONS_SET1,
	PERMISSIONS_SET2,
	PERMISSIONS_SET3,
	PERMISSIONS_SET4,
	PERMISSIONS_SET5,
	PERMISSIONS_SET6,
	PERMISSIONS_SET7,
	PERMISSIONS_SET8,
	PERMISSIONS_SET9,
	PERMISSIONS_SET10,
	FORMATTED_SET1,
	FORMATTED_SET2,
	FORMATTED_SET5,
	FORMATTED_SET6,
	FORMATTED_SET8,
	FORMATTED_SET8,
	FORMATTED_SET9,
	FORMATTED_SET10,
	INSTANCE_SET1,
	INSTANCE_SET2,
	INSTANCE_SET3,
	INSTANCE_SET4
}
