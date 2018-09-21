# API

## Table of contents
- [CommonMessage](#commonmessage)
- [Constants](#constants)
- [Deploy a service](#deploy-a-service)
- [Service](#service)
- [BusConnection](#busconnection)
- [PermissionManager](#permissionmanager)

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

## Constants

Platform 6 available constants.

```typescript
import { Constants } from '@amalto/platform6-client'

// Platform 6 Scripts service's id
Constants.SERVICE_SCRIPTS_ID

// Main key of a response common message
Constants.PLATFORM6_RESPONSE_VALUE
```

## Deploy a service

`function deployService(parameters: DeployParameters): Promise<Service> `

__Argument__

```typescript
export interface DeployParameters {
	/** Service's identifier. */
	id: string
	/** Path of the endpoint's URL to get the service's client script. */
	path: string
	/** Base path of the endpoint's URL to get the service's client script.  */
	basePath: string
	/** Semver version of all the service's components. */
	versions: Versions | string
	/** Properties of the service's entry menu. */
	ui: UserInterfaceProperties
}

export interface Versions {
	/** Semver version of the service server. */
	server: string
	/** Semver version of the service client. */
	client: string
}

export interface UserInterfaceProperties {
	/** Visibility of the entry menu. */
	visible: boolean
	/** Icon's name of the entry menu. */
	iconName: string
	/** Position of the entry in the menu. */
	weight: number
	/** Multi-language label for the entry menu (language: 'en-US', 'fr-FR'). */
	label: { [key: string]: string }
}
```

__Result__

The [service's instance](#service).

__Example__

```typescript
import { deployService } from '@amalto/platform6-client'

const myServiceId = 'demo.typescript'

// Create a new service named 'demo.typescript'
deployService({
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

## Service

### Get the id of the instance on which is deployed the service

__Example__

```typescript
import { deployService } from '@amalto/platform6-client'

deployService({ /* ... */ })
	.then((service: any) => {
		console.log('The service "%s" has been deployed on instance "%s".', service.id, service.instanceId)
	})
```

### Undeploy a service

`function undeployService(): Promise<CommonMessage>`

__Result__

The Platform 6 Manager service response.

__Example__

```typescript
import { deployService } from '@amalto/platform6-client'

deployService({ /* ... */ })
	.then((service: any) => service.undeployService())
```

### Send a request to another service

`function callService(parameters: CallServiceParameters): Promise<CommonMessage>`

__Argument__

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

__Result__

The Platform 6 receiver service response.

__Example__

```typescript
import { Constants, deployService } from '@amalto/platform6-client'

deployService({ /* ... */ })
	.then((service: any) => {
		// Ask the Scripts service to create a new script
		service.callService({
			username: 'admin@amalto.com',
			receiverId: Constants.SERVICE_SCRIPTS_ID,
			action: 'add',
			headers: [
				['id', 'ondiflo.script1'],
				['description', '{EN: Scritpt 1 of Ondiflo}'],
				['main.content', 'pipeline.variables().each() println "${it}"']
			]
		})
	})
```

## BusConnection

Some methods to manage the common messages.

### Get the value of a common message's header by key

`function getHeaderValue(commonMessage: CommonMessage, key: string): string | object | null`

__Arguments__

- `commonMessage`: the common message received
- `key`: the header's key

__Result__

The value of the requested header's key.

__Example__

```typescript
import { BusConnection, Constants, deployService } from '@amalto/platform6-client'

deployService({ /* ... */ })
	.then((service: any) => {
		// Ask the Scripts service to list its items ids
		const scriptsResponse = await service.callService({
			username: 'admin@amalto.com',
			receiverId: Constants.SERVICE_SCRIPTS_ID,
			action: 'list.ids'
		})

		// Get the value from the service Platform 6 Scripts's response
		const ids = BusConnection.getHeaderValue(scriptsResponse, Constants.SERVICE_SCRIPTS_ID, Constants.PLATFORM6_RESPONSE_VALUE)
	})
```

## PermissionManager

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

### Get the permissions of a user

`function getUserPermissions(request: any): Promise<InstancePermissions>`

__Argument__

- `request`: the user's HTTP request

__Example__

```typescript
import { PermissionsManager } from '@amalto/platform6-client'

app.get(`${path}/permissions`, async function (request, response) {
	// Retrieve the permissions of the user doing the request
	const permissions = await PermissionsManager.getUserPermissions(request)

	response.status(200).send(permissions)
})
```

### Check if the user has the required permissions on a specific instance

`function hasPermissions(instance: string, userInstancesPermissions: InstancePermissions, requiredPermissions: FormattedPermission[]): boolean`

__Arguments__

- `instance`: the name of the instance on which the user is assigned
- `userInstancesPermissions`: the set of permissions assigned to a user on all instances
- `requiredPermissions`: the permission(s) required to process an action

__Example__

```typescript
import { PermissionsManager } from '@amalto/platform6-client'

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

### Check if the user has at least one of the required permissions

`function hasAnyPermissions(instance: string, userInstancesPermissions: InstancePermissions, requiredPermissions: FormattedPermission[]): boolean`

__Arguments__

- `instance`: the name of the instance on which the user is assigned
- `userInstancesPermissions`: the set of permissions assigned to a user on all instances
- `requiredPermissions`: the permission(s) required to process an action

__Example__

```typescript
import { PermissionsManager } from '@amalto/platform6-client'

app.get(`${path}/permissions`, async function (request, response) {
	// Retrieve the permissions of the user doing the request
	const permissions = await PermissionsManager.getUserPermissions(request)

	// Check that the user has the permission "demo.typescript=read" or the permission "demo.typescript=read('Report 1')" to receive the permissions
	if (!PermissionsManager.hasAnyPermissions('Roxane', permissions, [{ feature: myServiceId, action: 'read' }, { feature: myServiceId, action: 'read', values: ['Report 1'] }])) {
		response.status(403).send({
			message: `Unauthorized: you need to have the permission "${myServiceId}=read" or the permission "${myServiceId}=read('Report 1)"`
		})
	}

	response.status(200).send(permissions)
})
```
