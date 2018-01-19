export interface ScopeValue {
	[viewFilter: string]: {
		orgFilter: 'UNIT' | 'USER' | 'BRANCH';
		searchable: string;
		comparisonOperator: '=' | '>' | '>=' | '<' | '<=' | '~';
		value: string;
	}[]
}

export interface ScopesTree {
	[appInstance: string]: {
		[feature: string]: {
			[action: string]: string[] | ScopeValue
		}
	}
}

export interface PermissionDef {
	feature: string;
	action: string;
	requiredValue: string;
}

const ASTERISK = '*'

export function hasPermission(scopesTree: ScopesTree, instanceName: string, permission: string, global?: boolean): boolean {
	return hasAnyPermission(scopesTree, instanceName, [permission], global)
}

export function hasAnyPermission(scopesTree: ScopesTree, instanceName: string, permissions: string[] | PermissionDef[], global?: boolean) {

	if (!permissions || !permissions.length || !instanceName) {
		return false
	}

	for (let i = 0; i < permissions.length; i++) {
		if (typeof permissions[i] === 'object') {

			//if the permission is required globally, the check will be only on the * instance
			const appInstanceValues = getScopeValues(scopesTree, global ? ASTERISK : instanceName, (permissions[i] as PermissionDef).feature, (permissions[i] as PermissionDef).action)

			if (appInstanceValues) {

				if ($.isEmptyObject(appInstanceValues)) {
					return true
				}

				if ((appInstanceValues as string[]).length) {
					if ((appInstanceValues as string[]).indexOf((permissions[i] as PermissionDef).requiredValue) !== -1) {
						return true
					}
				}

			}

			//check values on * instance
			if (!global) {

				const asteriskValues = getScopeValues(scopesTree, ASTERISK, (permissions[i] as PermissionDef).feature, (permissions[i] as PermissionDef).action)

				if (asteriskValues) {
					if ($.isEmptyObject(asteriskValues)) {
						return true
					}

					if ((asteriskValues as string[]).length) {
						if ((asteriskValues as string[]).indexOf((permissions[i] as PermissionDef).requiredValue) !== -1) {
							return true
						}
					}
				}

			}

		}
		else if (typeof permissions[i] === 'string') {

			const parsedScopeString = (permissions[i] as string).split('=')

			if (parsedScopeString.length === 2) {
				if (hasPermissionFor(scopesTree, global ? ASTERISK : instanceName, parsedScopeString[0], parsedScopeString[1])) {
					return true
				}
			}
			else {
				console.log('Error - bad scope string value:', permissions[i])
			}

		}
	}

	return false

}

function hasPermissionFor(scopesTree: ScopesTree, instanceName: string, feature: string, action: string): boolean {

	return (
		hasAccessToAction(scopesTree, instanceName, feature, action) ||
		hasAccessToAction(scopesTree, instanceName, feature, ASTERISK) ||
		hasAccessToAction(scopesTree, instanceName, ASTERISK, ASTERISK) ||
		hasAccessToAction(scopesTree, ASTERISK, feature, action) ||
		hasAccessToAction(scopesTree, ASTERISK, feature, ASTERISK) ||
		hasAccessToAction(scopesTree, ASTERISK, ASTERISK, ASTERISK)
	)

}

export function getScopeValues(scopesTree: ScopesTree, instanceName: string, feature: string, action: string): ScopeValue | string[] {

	return scopesTree && scopesTree[instanceName] && scopesTree[instanceName][feature] && scopesTree[instanceName][feature][action]

}

export function hasAccessToFeature(scopesTree: ScopesTree, instanceName: string, feature: string, global?: boolean): boolean {

	if (!scopesTree || !instanceName || !feature) {
		return false
	}

	const featuresMap = scopesTree[global ? ASTERISK : instanceName]

	for (let _feature in featuresMap) {
		if (_feature === feature || _feature === ASTERISK) {
			return true
		}
	}

	//if we don't find an access to the feature on the specific instance, we can check on the * one
	if (!global) {
		return hasAccessToFeature(scopesTree, instanceName, feature, true)
	}

	return false

}

function hasAccessToAction(scopesTree: ScopesTree, instanceName: string, feature: string, action: string) {

	if (!instanceName || !feature || !action) {
		return false
	}

	if (hasAccessToFeature(scopesTree, instanceName, feature)) {
		return getScopeValues(scopesTree, instanceName, feature, action) !== undefined
	}
	else {
		return false
	}

}

export function hasFilterOn(scopesTree: ScopesTree, instanceName: string, feature: string, viewFilter: string, filterKey: string): boolean {

	//filter by key value are made via the keyword 'allow'

	const appInstanceValues = instanceName ? getScopeValues(scopesTree, instanceName, feature, 'allow') as ScopeValue : undefined
	const asteriskValues = getScopeValues(scopesTree, ASTERISK, feature, 'allow') as ScopeValue

	if (appInstanceValues && appInstanceValues[viewFilter]) {
		if (appInstanceValues[viewFilter].filter(scopeFilter => scopeFilter.searchable === filterKey).length > 0) {
			return true
		}
	}

	if (asteriskValues && asteriskValues[viewFilter]) {
		if (asteriskValues[viewFilter].filter(scopeFilter => scopeFilter.searchable === filterKey).length > 0) {
			return true
		}
	}

	return false

}
