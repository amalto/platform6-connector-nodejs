# API

## Table of contents
- [Service](#service)
- [CommonMessage](#servicecommonmessage)
- [Service.deployed](#servicedeployed)
- [Service.undeploy](#serviceundeploy)
- [Service.callService](#servicecallservice)
- [Service.BusConnection.getHeaderValue](#servicebusconnectiongetheadervalue)
- [Service.PermissionManager](#servicepermissionmanager)
- [Service.Constants](#serviceconstants)

## Service

Platform 6 service.

`new Service(parameters: DeployParameters): Service`

__Argument:__
```typescript
interface DeployParameters {
	/** Service's identifier. */
	id: string

	/** Path of the endpoint's URL to get the service's client script. */
	path: string

	/** Base path of the endpoint's URL to get the service's client script.
	 * Windows: `IP address`
	 * Mac: `http://docker.for.mac.localhost:8000` */
	basePath: string

	/** Semver version of all the service's components. */
	versions: Versions | string

	/** Properties of the service's entry menu. */
	ui: UserInterfaceProperties
}

interface Versions {
	/** Semver version of the service server. */
	server: string

	/** Semver version of the service client. */
	client: string
}
```

__Example:__
```typescript
const myServiceId = 'demo.typescript'

// Create a new service named 'demo.typescript'
new Service({
	id: myServiceId,
	path: `/${myServiceId}/api`,
	basePath: 'http://docker.for.mac.localhost:8000',
	versions: '1.0.0',
	ui: {
		visible: true,
		iconName: 'fa-code',
		weight: 30,
		label: {
			'en-US': 'TypeScript',
			'fr-FR': 'TypeScript'
		}
	}
})
```

## CommonMessage

The data exchanged between services are called __common messages__. A common message is a generic message with headers and attachments.

It consists of:

```typescript
interface CommonMessage {
	/* Common message’s unique identifier */
	id: string,

	/* Sender’s identifier */
	replyTo: string,

	/* Common message’s content (advised if value is lower than 32 kb) */
	headers: Header[],

	/* Common message’s additional content (advised if value is higher than 32 kb) */
	attachments: Attachment[]
}

interface Header { key: string, value: string }

interface Attachment { headers: Header[], bytes: string }
```

## Service.deployed

Platform 6 service instance.

__Type__: `Promise<void>`

__Example__:
```typescript
const service = new Service({ /* ... */ })

service.deployed.catch(console.error)
```

## Service.undeploy

Undeploy a service on the Platform 6 instance.

`undeployService(): Promise<CommonMessage>`

__Example__
```typescript
const service = new Service({ /* ... */ })

service.undeploy()
```

## Service.callService

Send a request to another service.

`callService(parameters: CallServiceParameters): Promise<CommonMessage>`

__Argument:__
```typescript
interface CallServiceParameters {
	/** Identifier of the recipient service. */
	receiverId: string

	/** Email address of the caller. */
	username?: string

	/** Define the Platform 6 specific `action` header value. */
	action?: string

	/** Custom headers to be sent with the request. */
	headers?: [string, string | object][] | Header[]

	/** Custom attachments to be sent with the request. */
	attachments?: Attachment[]
}
```

__Example__:
```typescript
const service = new Service({ /* ... */ })

// Ask the service platform6.scripts to create a new script
service.callService({
	username: 'admin@amalto.com',
	receiverId: Service.Constants.SERVICE_SCRIPTS_ID,
	action: 'add',
	headers: [
		['platform6.request.user', 'admin@amalto.com'],
		['scriptId', 'ondiflo.script1'],
		['scriptDescription', '{EN: Scritpt 1 of Ondiflo}'],
		['mainScriptContent', 'pipeline.variables().each() println "${it}"']
	]
})
```

## Service.BusConnection.getHeaderValue

Get the value of a common message's header by key.

`getHeaderValue(commonMessage: CommonMessage, serviceId: string, key: string): string | object | null`

__Example__:
```typescript
const service = new Service({ /* ... */ })

// Ask the service platform6.scripts to list its items
const scriptsResponse = await service.callService({
	username: 'admin@amalto.com',
	receiverId: Service.Constants.SERVICE_SCRIPTS_ID,
	action: 'list',
	headers: [ ['platform6.request.user', 'admin@amalto.com'] ]
})

// Get the value from the service Platform 6 Scripts's response
const items = Service.BusConnection.getHeaderValue(scriptsResponse, Service.Constants.SERVICE_SCRIPTS_ID, 'scriptIds')
```

## Service.PermissionManager

Each user is assigned a set of permissions on a instance.
A permission is a string of characters structured as follows `feature=action(values)` and which allows the user to perform a specific action on a specific feature.

Here is the structure of a set of permissions assigned to an instance:

```typescript
interface InstancePermissions {
	/** The set of a user's permissions assigned to an instance **/
	[instance: string]: Permissions
}

interface Permissions {
	/** The set of permissions **/
	[feature: string]: {
		[action: string]: PermissionValue
	}
}

type PermissionValue = string[] | {}

interface FormattedPermission {
	/** The feature of the permission **/
	feature: string
	/** The action of the permission **/
	action: string
	/** The optional values of the permission **/
	values?: string[]
}
```

## Get the permissions of a user

`getUserPermissions(request: any): Promise<InstancePermissions>`

__Example__:
```typescript
const service = new Service({ /* ... */ })

app.get(`${path}/permissions`, async function (request, response) {
	// Retrieve the permissions of the user doing the request
	const permissions = await PermissionsManager.getUserPermissions(request)

	response.status(200).send(permissions)
})
```

## Check if the user has the required permissions on a specific instance

`hasPermissions(instance: string, userInstancesPermissions: InstancePermissions, requiredPermissions: FormattedPermission[]): boolean`

__Arguments:__

- `instance`: the name of the instance on which the user is assigned
- `userInstancesPermissions`: the set of permissions assigned to a user on all instances
- `requiredPermissions`: the permission(s) required to process an action

__Example__:
```typescript
const service = new Service({ /* ... */ })

app.get(`${path}/permissions`, async function (request, response) {
	// Retrieve the permissions of the user doing the request
	const permissions = await PermissionsManager.getUserPermissions(request)

	// Check that the user has the permission "demo.typescript=read" to receive the permissions
	if (!PermissionsManager.hasPermissions('Roxane', permissions, [{ feature: myServiceId, action: 'read' }])) {
		response.status(403).send({ message: `Unauthorized: you need to have the permission "${myServiceId}=read"` })
	}

	response.status(200).send(permissions)
})
```

## Check if the user has at least one of the required permissions

`hasAnyPermissions(instance: string, userInstancesPermissions: InstancePermissions, requiredPermissions: FormattedPermission[]): boolean`

__Arguments:__

- `instance`: the name of the instance on which the user is assigned
- `userInstancesPermissions`: the set of permissions assigned to a user on all instances
- `requiredPermissions`: the permission(s) required to process an action

__Example__:
```typescript
const service = new Service({ /* ... */ })

app.get(`${path}/permissions`, async function (request, response) {
	// Retrieve the permissions of the user doing the request
	const permissions = await PermissionsManager.getUserPermissions(request)

	// Check that the user has the permission "demo.typescript=read" or the permission "demo.typescript=read('Report 1')" to receive the permissions
	if (!PermissionsManager.hasAnyPermissions('Roxane', permissions, [{ feature: myServiceId, action: 'read' }, { feature: myServiceId, action: 'read', values: ['Report 1'] }])) {
		response.status(403).send({ message: `Unauthorized: you need to have the permission "${myServiceId}=read" or the permission "${myServiceId}=read('Report 1)"` })
	}

	response.status(200).send(permissions)
})
```

## Service.Constants

Platform 6 constants.

- `SERVICE_SCRIPTS_ID`: Platform 6 Scripts service's id

