import { Address, Client as HazelcastClient, Config } from 'hazelcast-client'
import { BusConnection, HeaderObject } from './busConnection'
import { CommonMessage, Header, Attachment } from './messages/commonMessage'
import { Constants } from './constants'
import { CommonMessageSerializer } from './serializers/commonMessageSerializer'
import { v4 as uuid } from 'uuid'

declare namespace Service {
	interface UserInterfaceProperties {
		/** Visibility of the entry menu. */
		visible: boolean
		/** Icon's name of the entry menu. */
		iconName: string
		/** Position of the entry in the menu. */
		weight: number
		/** Multi-language label for the entry menu (language: 'en-US', 'fr-FR'). */
		label: { [key: string]: string }
	}

	interface Versions {
		/** Semver version of the service server. */
		server: string
		/** Semver version of the service client. */
		client: string
	}

	interface DeployParameters {
		/** Email address of the caller. */
		username: string
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

	interface CallServiceParameters {
		/** Email address of the caller. */
		username: string
		/** Identifier of the recipient service. */
		receiverId: string
		/** Define the Platform 6 specific `action` header value. */
		action?: string
		/** Custom headers to be sent with the request. */
		headers?: HeaderObject[]
		/** Custom attachments to be sent with the request. */
		attachments?: Attachment[]
	}
}

/** Platform 6 service. */
class Service {
	static BusConnection = BusConnection
	static Constants = Constants

	private idKey: string

	/** Hazelcast client instance */
	public client: HazelcastClient
	/** Platform 6 service instance */
	public deployed: Promise<void>

	constructor(parameters: Service.DeployParameters) {
		this.idKey = Constants.SENDER_ID_PREFIX + parameters.id
		this.deployed = this.deployService(parameters)
	}

	private async createHazelcastClient() {
		const config = new Config.ClientConfig()
		const hostname = process.env.HOSTNAME || 'localhost'
		const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5900

		config.serializationConfig.customSerializers.push(new CommonMessageSerializer)
		config.networkConfig.addresses = [new Address(hostname, port)]

		this.client = await HazelcastClient.newHazelcastClient(config)
	}

	private async deployService(parameters: Service.DeployParameters) {
		if (!this.client) await this.createHazelcastClient()

		const { SERVICE_MANAGER_ID } = Constants
		const { versions } = parameters

		const response = await this.callService({
			username: parameters.username,
			receiverId: SERVICE_MANAGER_ID,
			action: Constants.ACTION_DEPLOY,
			headers: [
				['node.id', uuid()],
				['service.id', parameters.id],
				['service.path', parameters.path],
				['service.ctx', parameters.basePath],
				['service.version', typeof versions === 'string' ? versions : versions.server],
				['service.ui.version', typeof versions === 'string' ? versions : versions.client],
				['service.ui', parameters.ui],
			]
		})
	}

	/**
	 * Send a request to another service.
	 *
	 * @param parameters Required parameters for the request.
	 * @return Response of the service.
	 */
	public async callService(parameters: Service.CallServiceParameters): Promise<CommonMessage> {
		const { receiverId } = parameters
		const headers = [BusConnection.createHeader(null, Constants.USER_KEY, parameters.username)]

		if (parameters.action)
			headers.push(BusConnection.createHeader(receiverId, 'action', parameters.action))
		if (parameters.headers)
			headers.push(...BusConnection.parseHeaders(receiverId, parameters.headers))

		const commonMessage = await BusConnection.createCommonMessage(this.idKey, headers, parameters.attachments || [])
		const response = await this.sendCommonMessage(receiverId, commonMessage)

		return response
	}

	/**
	 * Send a message to another service.
	 *
	 * @param receiverId Identifier of the service receiving the message.
	 * @param commonMessage Message sent.
	 */
	public async sendCommonMessage(receiverId: string, commonMessage: CommonMessage): Promise<CommonMessage> {
		const hazelcastClient = this.client
		const receiverIdKey = Constants.RECEIVER_ID_PREFIX + receiverId
		const request = hazelcastClient.getQueue<CommonMessage>(receiverIdKey)
		const isSent = await request.offer(commonMessage)

		if (!isSent) throw new Error(`Unable to send the common message with id ${commonMessage.id}!`)

		BusConnection.displayCommonMessage(receiverIdKey, commonMessage)

		const response = await hazelcastClient.getQueue<CommonMessage>(this.idKey).take()

		BusConnection.displayCommonMessage(receiverIdKey, response)

		if (response.id !== commonMessage.id)
			throw new Error(`Common message response\'s id "${response.id}" is not the same as the common message request id "${commonMessage.id}"!`)

		return response
	}
}

export default Service;
