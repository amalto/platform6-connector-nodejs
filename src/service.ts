import { Client as HazelcastClient } from 'hazelcast-client'
import { createCommonMessage, createHeader, displayCommonMessage, parseHeaders, HeaderObject } from './busConnection'
import { CommonMessage, Attachment } from './messages/commonMessage'
import { Constants } from './constants'

export interface CallServiceParameters {
	/** Identifier of the recipient service. */
	receiverId: string
	/** Email address of the caller. */
	username?: string
	/** Define the Platform 6 specific `action` header value. */
	action?: string
	/** Custom headers to be sent with the request. */
	headers?: HeaderObject[]
	/** Custom attachments to be sent with the request. */
	attachments?: Attachment[]
}

/** Platform 6 service. */
class Service {
	/** The identifier of the service */
	private id: string
	/** The service's id formatted into a key */
	private idKey: string
	/** The identifier of the node */
	private nodeId: string

	/** Hazelcast client instance */
	public client: HazelcastClient
	/** Platform 6 instance's id */
	public instanceId: string

	/**
	 * Create an instance of Platform 6 service
	 *
	 * @param client Hazelcast client instance
	 * @param id The identifier of the service
	 * @param nodeId The identifier of the node
	 */
	constructor(client: HazelcastClient, nodeId: string, id: string) {
		this.client = client
		this.id = id
		this.idKey = Constants.SENDER_ID_PREFIX + id
		this.nodeId = nodeId
	}

	/**
	 * Undeploy the service
	 */
	public async undeployService() {
		await this.callService({
			receiverId: Constants.SERVICE_MANAGER_ID,
			action: Constants.ACTION_UNDEPLOY,
			headers: [
				[`${Constants.PLATFORM6_APP_KEY}node.id`, this.nodeId],
				[`${Constants.PLATFORM6_APP_KEY}service.id`, this.id]
			]
		})
	}

	/**
	 * Send a request to another service.
	 *
	 * @param parameters Required parameters for the request.
	 * @return Response of the service.
	 */
	public async callService(parameters: CallServiceParameters): Promise<CommonMessage> {
		const { receiverId } = parameters
		const headers = []

		if (parameters.username)
			headers.push(createHeader(Constants.USER_KEY, parameters.username))
		if (parameters.action)
			headers.push(createHeader(`${Constants.PLATFORM6_APP_KEY}request.action`, parameters.action))
		if (parameters.headers)
			headers.push(...parseHeaders(parameters.headers))

		const commonMessage = await createCommonMessage(this.idKey, parameters.receiverId, headers, parameters.attachments || [])
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

		displayCommonMessage(receiverIdKey, commonMessage)

		const response = await hazelcastClient.getQueue<CommonMessage>(this.idKey).take()

		displayCommonMessage(receiverIdKey, response)

		if (response.id !== commonMessage.id)
			throw new Error(`Common message response\'s id "${response.id}" is not the same as the common message request id "${commonMessage.id}"!`)

		return response
	}
}

export default Service
