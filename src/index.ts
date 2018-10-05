import { Client as HazelcastClient, Config } from 'hazelcast-client'
import { getHeaderValue } from './busConnection'
import { Constants } from './constants'

import CommonMessageSerializer from './serializers/commonMessageSerializer'
import HazelcastLogger from './loggers/hazelcastLogger'
import Service from './service'

import * as memoize from 'mem'

export interface UserInterfaceProperties {
	/** Visibility of the entry menu */
	visible: boolean
	/** Icon's name of the entry menu */
	iconName: string
	/** Position of the entry in the menu */
	weight: number
	/** Multi-language label for the entry menu (language: 'en-US', 'fr-FR') */
	label: { [key: string]: string }
}

export interface Versions {
	/** Semver version of the service server */
	server: string
	/** Semver version of the service client */
	client: string
}

export interface DeployParameters {
	/** Service's identifier */
	id: string
	/** Path of the endpoint's URL to get the service's client script */
	path: string
	/** Base path of the endpoint's URL to get the service's client script  */
	basePath: string
	/** Semver version of all the service's components */
	versions: Versions | string
	/** Properties of the service's entry menu */
	ui: UserInterfaceProperties
}

/**
 * Deploy the service
 *
 * @param parameters Deployment parameters
 *
 * @return A promise resolving with a deployed instance of the Platform 6 service
 */
export async function deployService(parameters: DeployParameters): Promise<Service> {
	const client = await createHazelcastClient()

	const { SERVICE_MANAGER_ID } = Constants
	const { id, versions } = parameters
	const nodeId = client.getLocalEndpoint().uuid
	const service = new Service(client, nodeId, id)

	const message = await service.callService({
		receiverId: SERVICE_MANAGER_ID,
		action: Constants.ACTION_DEPLOY,
		headers: [
			[`${Constants.PLATFORM6_APP_KEY}node.id`, nodeId],
			[`${Constants.PLATFORM6_APP_KEY}service.id`, id],
			[`${Constants.PLATFORM6_APP_KEY}service.path`, parameters.path],
			[`${Constants.PLATFORM6_APP_KEY}service.ctx`, parameters.basePath],
			[`${Constants.PLATFORM6_APP_KEY}service.version`, typeof versions === 'string' ? versions : versions.server],
			[`${Constants.PLATFORM6_APP_KEY}service.ui.version`, typeof versions === 'string' ? versions : versions.client],
			[`${Constants.PLATFORM6_APP_KEY}service.ui`, parameters.ui],
		]
	})

	try {
		service.instanceId = (getHeaderValue(message, 'platform6.application.conf') as any).applicationid
	} catch (error) {
		console.log(`Unexpected error retrieving the instance\'s id: ${error}`)
	}

	return service
}

const createHazelcastClient = memoize(async function () {
	const config = new Config.ClientConfig()
	const hostname = process.env.HOSTNAME || 'localhost'
	const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5900

	config.serializationConfig.customSerializers.push(new CommonMessageSerializer)
	config.networkConfig.addresses = [`${hostname}:${port}`]
	config.properties['hazelcast.logging'] = new HazelcastLogger as any

	return await HazelcastClient.newHazelcastClient(config)
})

export { PermissionsManager } from './permissionsManager'
export { BusConnection } from './busConnection'
export { Constants } from './constants'
