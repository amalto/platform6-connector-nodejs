# Platform 6 Node.js Connector

> [Platform 6](https://documentation.amalto.com/platform6/master/) Node.js connector

[![Build Status](https://api.travis-ci.org/amalto/platform6-connector-nodejs.svg?brancgh=master)](https://travis-ci.org/amalto/platform6-connector-nodejs)
[![Coverage Status](https://coveralls.io/repos/github/amalto/platform6-connector-nodejs/badge.svg?branch=master)](https://coveralls.io/github/amalto/platform6-connector-nodejs?branch=master)

This repository is a [Platform 6 connector](https://documentation.amalto.com/platform6/dev/develop-app/custom-service/platform6-cmb-connectors/) aiming to help the development a [service](https://documentation.amalto.com/platform6/master/developer-guide/getting-started/) in JavaScript.
It exposes, among others, methods to facilitate the communication with a Platform 6 instance.

## Requirements

Platform 6 connector depends on:

- [Node.js](https://nodejs.org/en/) (version `>= 4`),
- [Platform 6](https://documentation.amalto.com/platform6/master/user-guide/getting-started/) (version `5.17.0` and higher)

## Installing the connector

The following command installs Platform 6 connector as a Node.js dependency:

```console
$ npm install --save @platform6/platform6-connector
```

## Using the connector

### Demo project

You can find an example of a service using this library [here](https://github.com/amalto/platform6-service-typescript).

### Logging

We rely on the library [debug](https://github.com/visionmedia/debug) for debugging.

To display the logs of Platform 6, set the `DEBUG` environment variable like this:

```console
$ DEBUG=platform6:* node index.js
```

To filter the logs, please refer to [the documentation of debug](https://github.com/visionmedia/debug#debug).

### API

You will find the documentation of the methods exposed in the section [API](https://github.com/amalto/platform6-connector-nodejs/blob/master/API.md).

## Release notes

Please refer to [changelog](./CHANGELOG.md) to see the descriptions of each release.

## License

MIT © [Platform 6](https://www.platform6.io/)
