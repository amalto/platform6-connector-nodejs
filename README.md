# Platform 6 Node.js Client

> :construction: This project is currently in development. :construction:


__Platform 6__ is a platform to develop, package, distribute and run business applications involving _Business-to-Business_ transactions with automated processes and user actions.

## Requirements

Platform 6 depends on:

- Node.js (version `>= 4`),
- b2box (version `5.13.8` and higher)

> _b2box_ is the term used to define the previous versions of _Platform 6_.

## Installing the client

The following command installs Platform 6 client as a Node.js dependency:

```console
$ npm install --save @amalto/platform6-client
```

## Using the client

A few examples to get you started.

### Create a service
```javascript
import Service from '@amalto/platform6-client'

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

### Call another service
```javascript
// Ask the service platform6.scripts to list its items
service.callService({
	username: 'admin@amalto.com',
	receiverId: Service.Constants.SERVICE_SCRIPTS_ID,
	action: 'list'
})

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

### Logging

We rely on the library [debug](https://github.com/visionmedia/debug) for debugging.

To display the logs of Platform 6, set the `DEBUG` environment variable like this:

```console
$ DEBUG=platform6:* node index.js
```

To filter the logs, please refer to [the documentation of debug](https://github.com/visionmedia/debug#debug).

### Demo project

You can find an example of a service using this library [here](https://bitbucket.org/amalto/dev-service-typescript).

## Release notes

Please refer to [changelog](./CHANGELOG.md) to see the descriptions of each release.
