# Platform 6 Node.js Client

> :construction: This project is currently in development. :construction:


[__Platform 6__](https://github.com/amalto/platform6-wiki) is a platform to develop, package, distribute and run business applications involving _Business-to-Business_ transactions with automated processes and user actions.

## Requirements

Platform 6 depends on:

- [Node.js](https://nodejs.org/en/) (version `>= 4`),
- b2box (version `5.13.8` and higher)

> _b2box_ is the term used to define the previous versions of _Platform 6_.

## Installing the client

The following command installs Platform 6 client as a Node.js dependency:

```console
$ npm install --save @amalto/platform6-client
```

## Using the client

### Demo project

You can find an example of a service using this library [here](https://bitbucket.org/amalto/dev-service-typescript).

### Logging

We rely on the library [debug](https://github.com/visionmedia/debug) for debugging.

To display the logs of Platform 6, set the `DEBUG` environment variable like this:

```console
$ DEBUG=platform6:* node index.js
```

To filter the logs, please refer to [the documentation of debug](https://github.com/visionmedia/debug#debug).

### API

You will find the documentation of the methods exposed in the section [API](./API.md).

## Release notes

Please refer to [changelog](./CHANGELOG.md) to see the descriptions of each release.
