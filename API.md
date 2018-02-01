# API

## Table of contents:
- [Service](#service)
- [CommonMessage](#servicecommonmessage)
- [Service.deployed](#servicedeployed)
- [Service.callService](#servicecallservice)
- [Service.BusConnection.getHeaderValue](#servicebusconnectiongetheadervalue)
- [Service.Constants](#serviceconstants)

## Service

Platform 6 service.

`new Service(parameters: DeployParameters): Service`

__Argument:__
```typescript
interface DeployParameters {
	/** Email address of the caller. */
	username: string

	/** Service's identifier. */
	id: string

	/** Path of the endpoint's URL to get the service's client script. */
	path: string

	/** Base path of the endpoint's URL to get the service's client script.
	 * Windows: `${YOUR_ID_ADDRESS}:8000`
	 * Mac: `http://docker.for.mac.localhost:8000` */
	basePath: string

	/** Semver version of all the service's components. */
	versions: Versions | string

	/** Properties of the service's menu entry. */
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
```javascript
const myServiceId = 'demo.typescript'

// Create a new service named 'demo.typescript'
new Service({
	username: 'admin@amalto.com',
	id: myServiceId,
	path: `/api/${myServiceId}`,
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
```javascript
const service = new Service({ /* ... */ })

service.deployed.catch(console.error)
```

## Service.callService

Send a request to another service.

`callService(parameters: CallServiceParameters): Promise<CommonMessage>`

__Argument:__
```typescript
interface CallServiceParameters {
	/** Email address of the caller. */
	username: string

	/** Identifier of the recipient service. */
	receiverId: string

	/** Define the Platform 6 specific `action` header value. */
	action?: string

	/** Custom headers to be sent with the request. */
	headers?: [string, string | object][] | Header[]

	/** Custom attachments to be sent with the request. */
	attachments?: Attachment[]
}
```

__Example__:
```javascript
const service = new Service({ /* ... */ })

// Ask the service platform6.scripts to create a new script
service.callService({
	username: 'admin@amalto.com',
	receiverId: Service.Constants.SERVICE_SCRIPTS_ID,
	action: 'add',
	headers: [
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
```javascript
const service = new Service({ /* ... */ })

// Ask the service platform6.scripts to list its items
const scriptsResponse = await service.callService({
	username: 'admin@amalto.com',
	receiverId: Service.Constants.SERVICE_SCRIPTS_ID,
	action: 'list'
})

// Get the value from the service Platform 6 Scripts's response
const items = Service.BusConnection.getHeaderValue(scriptsResponse, Service.Constants.SERVICE_SCRIPTS_ID, 'scriptIds')
```

## Service.Constants

Platform 6 constants.

- `SERVICE_SCRIPTS_ID`: Platform 6 Scripts service's id

