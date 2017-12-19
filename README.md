# Platform 6 Node.js Client

> :construction: This project is currently in development. :construction:


__Platform 6__ is a platform to develop, package, distribute and run business applications involving _Business-to-Business_ transactions with automated processes and user actions.

## Requirements

- Platform 6 requires Node.js (>= 4).
- This client works with b2box 5.13.7 and higher. The b2box is the term used to define the previous versions of Platform 6.

## Installing the client

The following command install Platform 6 Node.js client as a Node.js dependency:

```console
$ npm install platform6-client --save
```

## Using the client

A few examples to get you started.

### Create a service
```javascript
import Service from 'platform6-client'

const myServiceId = 'demo.typescript'

// Create a new service named 'demo.typescript'
const service = new Service({
	username: 'admin@amalto.com',
	id: myServiceId,
	path: `/apis/v.1.0.0/${myServiceId}`,
	basePath: 'http://localhost:8000',
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

### Call a service
```javascript
// Ask the service platform6.scripts to list its items
service.callService({
	username: 'admin@amalto.com',
	receiverId: Service.Constants.SERVICE_SCRIPTS_ID,
	action: 'list'
})
```

### Logging

We use the library [debug](https://www.npmjs.com/package/debug) for debugging.

To display the logs of Platform 6, set the `DEBUG` environment variable like this:
```console
$ DEBUG=platform6:* node index.js
```

To filter the logs, please refer to the documentation of debug.

### Example

You can find an example of a service using this library [here](https://bitbucket.org/amalto/dev-service-typescript).

## Development

### Building and installing from sources

Follow the below steps to build and install Platform 6 Node.js client from its source:

- Clone the Bitbucket repository https://bitbucket.org/amalto/platform6-client-nodejs/overview
- Install the dependencies using the command `npm install`
- Compile the TypeScript using the command `npm run compile`
- Link the package locally using the command `npm link`
