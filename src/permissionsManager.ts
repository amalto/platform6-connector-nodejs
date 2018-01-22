import * as https from 'https'
import { userInfo } from 'os';

export interface Permission {
	[feature: string]: { [action: string]: string[] | {} }
}

export interface Permissions {
	[instance: string]: Permission
}

/**
 * Check that the user has a required permission
 *
 * @param instance the user's instance
 * @param permission the permission that the user needs to have
 * @param permissions the user's permissions
 */
export function hasPermission(instance: string, requiredPermission: Permission, userPermissions: Permissions): boolean {
	// TODO: return false or return an error?
	if (requiredPermission == null) return false

	const instancePermissions = userPermissions[instance]

	for (let feature in instancePermissions) {
		// Check that the user has the feature
		if (requiredPermission.hasOwnProperty(feature)) {
			// Check if there is an admin permission for the feature
			console.log('feature', feature)
			console.log('user permission', instancePermissions[feature])
			console.log('required permission', requiredPermission[feature])

			if (JSON.stringify(instancePermissions[feature]) === JSON.stringify({ "*": {} })) {
				return true
			}

			// Check that the feature's value is correct
			if (JSON.stringify(instancePermissions[feature]) === JSON.stringify(requiredPermission[feature])){
				return true
			}
		}
	}

	return false
}

/**
 * Check that the user has at least one of the required permissions
 *
 * @param instance the user's instance
 * @param permissions the permissions that the user needs to have at least one
 * @param userPermissions the user's permissions
 */
export function hasAnyPermission(instance: string, requiredPermissions: Permissions, userPermissions: Permissions): boolean {
	// TODO: return false or return an error?
	if (requiredPermissions == null) return false

	const instancePermissions = userPermissions[instance]
	const response = []

	for (let feature in instancePermissions) {
		let requiredPermission: any = {}
		requiredPermission[feature] = requiredPermissions[feature]

		response.push(hasPermission(instance, requiredPermission, userPermissions))
	}

	console.log('Response', response)

	return response.includes(true)
}

export class PermissionsManager {
	/** The authorization token */
	private static accessToken: string
	/** The user's permissions */
	private static permissions: Permissions

	static hasPermission = hasPermission
	static hasAnyPermission = hasAnyPermission

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


