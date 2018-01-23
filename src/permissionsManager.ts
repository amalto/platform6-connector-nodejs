import * as https from 'https'
import { Constants } from './constants'

export type Value = string[] | {}

export interface Permissions {
	[feature: string]: { [action: string]: Value }
}

/**
 * Compare two permissions' values
 *
 * @param requiredPermission the required permission
 * @param userPermission the user's permission
 */
export function compareValues(requiredPermission: Value, userPermission: Value): boolean {
	if (requiredPermission == null || userPermission == null) return false

	const userActions = Object.keys(userPermission)

	if (userActions.includes(Constants.PERMISSION_ADMIN)) return true

	return Object.keys(requiredPermission).some(v => userActions.includes(v))
}

/**
 * Check if the user has the required permissions
 *
 * @param requiredPermissions the required permissions
 * @param userPermissions the user's permissions
 */
export function hasPermissions(requiredPermissions: Permissions, userPermissions: Permissions): boolean {
	if (requiredPermissions == null || userPermissions == null) return false

	return Object
		.keys(requiredPermissions)
		.every(feature => feature in userPermissions && compareValues(requiredPermissions[feature], userPermissions[feature]))
}

/**
 * Check if the user has at least one of the required permissions
 *
 * @param requiredPermissions the required permissions
 * @param userPermissions the user's permissions
 */
export function hasAnyPermissions(requiredPermissions: Permissions, userPermissions: Permissions): boolean {
	if (requiredPermissions == null || userPermissions == null) return false

	return Object
		.keys(requiredPermissions)
		.some(feature => feature in userPermissions && compareValues(requiredPermissions[feature], userPermissions[feature]))
}

export class PermissionsManager {
	/** The authorization token */
	private static accessToken: string
	/** The user's permissions */
	private static permissions: Permissions

	static hasPermissions = hasPermissions
	static hasAnyPermissions = hasAnyPermissions

	/**
	 * Get the user's permissions for each instance
	 *
	 * @param request the request to build the service's user interface
	 */
	static getUserPermissions(request: any): void {
		// Get the authorization token to inject it in the following request
		const authorization = request.get('Authorization')
		this.accessToken = authorization.substring(7, authorization.length + 1)

		const options = {
			hostname: 'devlogin.amalto.io',
			path: '/apis/v2/scopestree',
			headers:{ 'Authorization': `Bearer ${this.accessToken}` }
		}

		const data = new Promise((resolve, reject) => {
			const request = https.get(options, response => {
				let data = ''

				response.on('data', chunk => data += chunk)
				response.on('end', () => resolve(data))
			})

			request.on('error', error => reject(error))
		})

		data.then(data => {
			this.permissions = <Permissions> JSON.parse(JSON.stringify(data))
			console.log('Permissions', this.permissions)
		})
	}
}


