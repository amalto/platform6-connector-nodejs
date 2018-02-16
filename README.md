# Platform 6 Node.js Client

> :construction: This project is currently in development. :construction:

:warning: This library is only useful for the users of [Platform 6](https://github.com/amalto/platform6-wiki)!

This repository is a [Platform 6 client](https://github.com/amalto/platform6-wiki/blob/master/create-service.md#platform-6-clients) aiming to help the development a [service](https://github.com/amalto/platform6-wiki/blob/master/create-service.md#platform-6-clients) in JavaScript.
It exposes, among others, methods to facilitate the communication with a Platform 6 instance.

## Requirements

Platform 6 depends on:

- [Node.js](https://nodejs.org/en/) (version `>= 4`),
- [_b2box_](https://github.com/amalto/platform6-wiki/blob/master/glossary.md#b2box) (version `5.13.8` and higher)

> _b2box_ is the term used to define the previous versions of _Platform 6_.

## Installing the client

The following command installs Platform 6 client as a Node.js dependency:

```console
$ npm install --save @amalto/platform6-client
```

## Using the client

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

You will find the documentation of the methods exposed in the section [API](https://github.com/amalto/platform6-client-nodejs/blob/master/API.md).

## Release notes

Please refer to [changelog](./CHANGELOG.md) to see the descriptions of each release.

## License

MIT © [Amalto Technologies](https://www.amalto.com/)
