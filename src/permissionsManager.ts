import * as https from 'https'
import { Constants } from './constants'
import { userInfo } from 'os';

export type PermissionValue = string[] | {}

export interface Permissions {
	[feature: string]: {
		[action: string]: PermissionValue
	}
}

export interface InstancePermissions {
	[instance: string]: Permissions
}

export interface FormattedPermission {
	feature: string
	action: string
	values?: string[]
}

/**
 * Compare the values of two permissions
 *
 * @param requiredPermission the required permission
 * @param userPermission the user's permission
 */
function compareValues(requiredPermission: PermissionValue, userPermission: PermissionValue): boolean {
	if (requiredPermission === null || userPermission === null) return false

	const userActions = Object.keys(userPermission)

	return userActions.includes(Constants.PERMISSION_ADMIN)
		|| Object.keys(requiredPermission).some(v => userActions.includes(v))
}

/**
 * Check if the user has a super permission ({ "*": "*": {} })
 *
 * @param userPermissions the user's permissions
 */
export function checkIfUserIsSuperUser(userPermissions: Permissions): boolean {
	if (userPermissions === null) return false

	return Object
		.keys(userPermissions)
		.some(feature => feature === Constants.PERMISSION_ADMIN &&
			Object
				.keys(userPermissions[feature])
			.some(action => action === Constants.PERMISSION_ADMIN))
}

/**
 * Get the permissions of a specific instance
 *
 * @param instance the name of the instance which the permissions need to be checked
 * @param instancePermissions the user's permissions for each instance he is associated with
 */
export function getPermissionsFromInstance(instance: string, instancePermissions: InstancePermissions): Permissions {
	if (instance === null || instance === '' || !instancePermissions) return null

	return (instance in instancePermissions) ? instancePermissions[instance] : null
}

/**
 * Merge the user's permissions on his instance and on the super instance
 * Note: if a permission exists on the super instance and not on the user's instance, add it in the response; if not ignore
 *
 * @param userPermissions the user's permissions on the user's instance
 * @param adminPermissions the user's permissions on the super instance
 */
export function mergePermissions(userPermissions: Permissions, adminPermissions: Permissions): Permissions {
	if (checkIfUserIsSuperUser(adminPermissions) || userPermissions === null) return adminPermissions

	const newUserPermissions = { ... userPermissions }

	if (adminPermissions !== null) {
		Object
			.keys(adminPermissions)
			.forEach(feature => {
				if (!newUserPermissions[feature]) newUserPermissions[feature] = adminPermissions[feature]
			})
	}

	return newUserPermissions
}

/**
 * Get the merged permissions
 *
 * @param instance the name of the user's Platform 6 instance
 * @param userInstancesPermissions the user's permissions on the instance
 * @param requiredPermissions the required permissions
 */
function getMergedPermissions(instance: string, userInstancesPermissions: InstancePermissions, requiredPermissions: Permissions): Permissions {
	if (instance === '' || instance === null) throw new Error('Platform 6 instance cannot be empty or null!')

	return mergePermissions(
		getPermissionsFromInstance(instance, userInstancesPermissions),
		getPermissionsFromInstance(Constants.PERMISSION_ADMIN, userInstancesPermissions)
	)
}

/**
 * Parse the formatted permissions
 *
 * @param formattedPermissions the formatted permissions
 */
export function parsePermissions(formattedPermissions: FormattedPermission[]): Permissions {
	if (!formattedPermissions || typeof formattedPermissions !== 'object') return null

	const permissions = <Permissions>{}

	formattedPermissions.forEach(f => {
		const { values } = f
		permissions[f.feature] = { [f.action]: !values ? {} : values }
	})

	return permissions
}

/**
 * Check if the user has the required permissions on a specific instance
 *
 * @param instance the name of the user's Platform 6 instance
 * @param userInstancesPermissions the user's permissions on the instance
 * @param requiredPermissions the required formatted permissions
 */
export function hasPermissions(
	instance: string, userInstancesPermissions: InstancePermissions, requiredPermissions: FormattedPermission[]
): boolean {
	const parsedRequiredPermissions = parsePermissions(requiredPermissions)
	const mergedPermissions = getMergedPermissions(instance, userInstancesPermissions, parsedRequiredPermissions)

	if (parsedRequiredPermissions == null || mergedPermissions == null) return false

	return checkIfUserIsSuperUser(mergedPermissions) ||
		Object
			.keys(parsedRequiredPermissions)
			.every(feature => feature in mergedPermissions && compareValues(parsedRequiredPermissions[feature], mergedPermissions[feature]))
}

/**
 * Check if the user has at least one of the required permissions
 *
 * @param instance the name of the user's Platform 6 instance
 * @param userInstancesPermissions the user's permissions on the instance
 * @param requiredPermissions the required formatted permissions
 */
export function hasAnyPermissions(
	instance: string, userInstancesPermissions: InstancePermissions, requiredPermissions: FormattedPermission[]
): boolean {
	const parsedRequiredPermissions = parsePermissions(requiredPermissions)
	const mergedPermissions = getMergedPermissions(instance, userInstancesPermissions, parsedRequiredPermissions)

	if (requiredPermissions == null || mergedPermissions == null) return false

	return checkIfUserIsSuperUser(mergedPermissions) ||
		Object
		.keys(parsedRequiredPermissions)
		.some(feature => feature in mergedPermissions && compareValues(parsedRequiredPermissions[feature], mergedPermissions[feature]))
}

/**
 * Get the permissions of the user calling the request
 *
 * @param request the request containing the authentication token
 */
export function getUserPermissions(request: any): Promise<InstancePermissions> {
	// Get the authorization token to inject it in the following request
	const authorization = request.get('Authorization')

	const options = {
		hostname: 'devlogin.amalto.io',
		path: '/apis/v2/scopestree',
		headers: { 'Authorization': authorization }
	}

	return new Promise<InstancePermissions>((resolve, reject) => https
		.get(options, response => {
			let data = ''

			response
				.on('data', chunk => data += chunk)
				.on('end', () => resolve(JSON.parse(data)))
		})
		.on('error', reject))
}


/**
 * [{ feature: 'feature 1', action: 'action 1', value: 'value 1'}, { feature: 'feature 2', action: 'action 2', value: 'value 2'}]
 *
 * {}
 * {[feature]: { [action]: value }}
 *
 */
