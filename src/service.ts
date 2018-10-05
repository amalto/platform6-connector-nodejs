import { Client as HazelcastClient } from 'hazelcast-client'
import { ItemEventListener, ItemListener, ItemEventType } from 'hazelcast-client/lib/core/ItemListener'
import { Member } from 'hazelcast-client/lib/core/Member'
import { v4 as uuid } from 'uuid'
import { createCommonMessage, createHeader, displayCommonMessage, parseHeaders, HeaderObject } from './busConnection'
import { CommonMessage, Attachment } from './messages/commonMessage'
import { Constants } from './constants'

export interface CallServiceParameters {
	/** Identifier of the recipient service */
	receiverId: string
	/** Email address of the caller */
	username?: string
	/** Define the Platform 6 specific `action` header value */
	action?: string
	/** Custom headers to be sent with the request */
	headers?: HeaderObject[]
	/** Custom attachments to be sent with the request */
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
	 * Listen to messages sent from another service
	 *
	 * @param itemAdded Action performed when a message is added to the queue
	 * @param itemRemoved Action performed when a message is removed from the queue
	 */
	public async registerListener(itemAdded: ItemEventListener<CommonMessage>, itemRemoved: ItemEventListener<CommonMessage>) {
		const queue = this.client.getQueue<CommonMessage>(Constants.RECEIVER_ID_PREFIX + this.id)
		const listener = {} as ItemListener<CommonMessage>

		if (itemAdded) listener.itemAdded = (item: CommonMessage, member: Member, type: ItemEventType) => {
			displayCommonMessage(item.destination, item)
			itemAdded(item, member, type)
		}

		if (itemRemoved) listener.itemRemoved = (item: CommonMessage, member: Member, type: ItemEventType) => {
			displayCommonMessage(item.destination, item)
			itemRemoved(item, member, type)
		}

		queue.addItemListener(listener, true)
	}

	/**
 	* Communicate with another service
	*
	* @param parameters Required parameters for the call
	* @param messageId Common message's identifier (null if it's a new exchange, the request message's identifier if not)
	* @return Response of the service if it's a new exchange
	*/
	public async callService(parameters: CallServiceParameters, messageId?: string): Promise<CommonMessage> {
		const { receiverId } = parameters
		const newExchange = !messageId
		const headers = []

		if (parameters.username)
			headers.push(createHeader(`${Constants.REQUEST_PREFIX}user`, parameters.username))
		if (parameters.action)
			headers.push(createHeader(`${Constants.REQUEST_PREFIX}action`, parameters.action))
		if (parameters.headers)
			headers.push(...parseHeaders(parameters.headers))

		const commonMessage = await createCommonMessage(
			this.prefixServiceId(parameters.receiverId, !newExchange),
			this.prefixServiceId(this.id, newExchange),
			headers,
			parameters.attachments || [],
			newExchange ? uuid() : messageId
		)
		const response = await this.exchangeCommonMessage(receiverId, commonMessage, newExchange)

		return response
	}

	/**
	 * Send and receive a message
	 *
	 * @param receiverId Service receiver's id
	 * @param commonMessage Message sent to the receiver
	 * @param newExchange Whether it's a new exchange
	 */
	private async exchangeCommonMessage(receiverId: string, commonMessage: CommonMessage, newExchange: boolean): Promise<CommonMessage> {
		const hazelcastClient = this.client
		const receiverIdKey = this.prefixServiceId(receiverId, !newExchange)
		const request = hazelcastClient.getQueue<CommonMessage>(receiverIdKey)
		const isSent = await request.offer(commonMessage)

		if (!isSent) throw new Error(`Unable to send the common message with id ${commonMessage.id}!`)

		displayCommonMessage(receiverIdKey, commonMessage)

		// This is a response to a message, no response is expected
		if (!newExchange) return

		const response = await hazelcastClient.getQueue<CommonMessage>(this.idKey).take()

		displayCommonMessage(receiverIdKey, response)

		if (response.id !== commonMessage.id)
			throw new Error(`Common message response\'s id "${response.id}" is not the same as the common message request id "${commonMessage.id}"!`)

		return response
	}

	/**
	 * Util method to prefix a service identifier
	 *
	 * @param serviceId Service identifier
	 * @param isFirst Whether the service is the first one to communicate
	 */
	private prefixServiceId(serviceId: string, isFirst: boolean) {
		return (isFirst ? Constants.SENDER_ID_PREFIX : Constants.RECEIVER_ID_PREFIX) + serviceId
	}
}

export default Service
