# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Use the latest version of the Hazelcast node.js client's dependency.
- The headers keys are no longer prefixed by `platform6.`.
- The header `user` is no longer required for the service's deployment.
- Update the URL of the Platform 6 documentation in the [README.md](./README.md).

## [0.2.2] - 2018-07-19
### Changed
- Update CMB headers to match the latest version of Platform 6.

## [0.2.0] - 2018-04-18
### Added
- Implement a continuous integration with [Travis](https://travis-ci.org/).
### Changed
Upgrade the version of the dependency Hazelcast node.js client
- Add the coverage badge.
- Expose a method to undeploy a service.
### Changed
- Update the structure of the common message object.

## [0.1.0] - 2018-02-16
### Added
- Add a link to the [`API.md`](./API.md) file on the `README.md`.
- Add a license MIT on the `README.md`.
- Expose methods to check that the user has the right permissions ([#1](https://github.com/amalto/platform6-client-nodejs/issues/1)).
### Changed
- Update the links to other repositories on the `README.md`.

## [0.0.1-alpha.11] - 2018-01-23
### Added
- Add the [`API.md`](./API.md) file.
### Changed
- Migrate the repository from Bitbucket to Github.

## [0.0.1-alpha.10] - 2018-01-05
### Added
- Add [a release script](./scripts/release.sh).
### Changed
- Update the structure of the `README.md` file.
- Update the format of the `CHANGELOG.md` file.

## [0.0.1-alpha.9] - 2017-12-27
### Changed
- Update the `package.json` dependencies.

## [0.0.1-alpha.8] - 2017-12-27
### Changed
- Rename the module `@amalto/platform6-client`

## [0.0.1-alpha.7] - 2017-12-22
### Added
- Add a MIT license.
- Add an example of calling a service in the `README.md`.

## [0.0.1-alpha.6] - 2017-12-22
### Changed
- Update the `README.md` file.

## [0.0.1-alpha.5] - 2017-12-21
### Added
- Add a `npm` script to publish the module on [npmjs](https://www.npmjs.com/).

## [0.0.1-alpha.4] - 2017-12-21
### Changed
- Change an intern header's name of the common message to deploy a service. Use `service.ctx` instead of `service.altContextUrl`.

## [0.0.1-alpha.3] - 2017-12-20
### Changed
- Rename the module `@platform6/platform6-client`.

## [0.0.1-alpha.2] - 2017-12-20
Nothing new.

## 0.0.1-alpha.1 - 2017-12-14
### Added
- Expose methods to create a common message.
- Expose methods to deploy and call a service.
- Expose global constants.


[Unreleased]: https://bitbucket.org/amalto/platform6-client-nodejs/branches/compare/HEAD..0.0.1-alpha.9
[0.2.2]: https://bitbucket.org/amalto/platform6-client-nodejs/branches/compare/v0.2.2..0.0.1-alpha.9
[0.2.0]: https://bitbucket.org/amalto/platform6-client-nodejs/branches/compare/v0.2.0..0.0.1-alpha.9
[0.1.0]: https://bitbucket.org/amalto/platform6-client-nodejs/branches/compare/v0.1.0..0.0.1-alpha.9
[0.0.1-alpha.11]: https://bitbucket.org/amalto/platform6-client-nodejs/branches/compare/v0.0.1-alpha.11..0.0.1-alpha.9
[0.0.1-alpha.10]: https://bitbucket.org/amalto/platform6-client-nodejs/branches/compare/v0.0.1-alpha.10..0.0.1-alpha.9
[0.0.1-alpha.9]: https://bitbucket.org/amalto/platform6-client-nodejs/branches/compare/0.0.1-alpha.9..0.0.1-alpha.8
[0.0.1-alpha.8]: https://bitbucket.org/amalto/platform6-client-nodejs/branches/compare/0.0.1-alpha.8..0.0.1-alpha.7
[0.0.1-alpha.7]: https://bitbucket.org/amalto/platform6-client-nodejs/branches/compare/0.0.1-alpha.7..0.0.1-alpha.6
[0.0.1-alpha.6]: https://bitbucket.org/amalto/platform6-client-nodejs/branches/compare/0.0.1-alpha.6..0.0.1-alpha.5
[0.0.1-alpha.5]: https://bitbucket.org/amalto/platform6-client-nodejs/branches/compare/0.0.1-alpha.5..0.0.1-alpha.4
[0.0.1-alpha.4]: https://bitbucket.org/amalto/platform6-client-nodejs/branches/compare/0.0.1-alpha.4..0.0.1-alpha.3
[0.0.1-alpha.3]: https://bitbucket.org/amalto/platform6-client-nodejs/branches/compare/0.0.1-alpha.3..0.0.1-alpha.2
[0.0.1-alpha.2]: https://bitbucket.org/amalto/platform6-client-nodejs/branches/compare/0.0.1-alpha.2..0.0.1-alpha.1
