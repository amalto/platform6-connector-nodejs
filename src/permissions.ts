import * as https from 'https'
import { start } from 'repl';

export class Permissions {
	private static accessToken: string
	private static permissions: {}

	static getUserPermissions(request: any): void {
		const authorization = request.get('Authorization')
		this.accessToken = authorization.substring(7, authorization.length + 1)

		const options = {
			hostname: 'devlogin.amalto.io',
			path: '/apis/v2/scopestree',
			headers:{ 'Authorization': `Bearer ${this.accessToken}` }
		}

		const scopes = new Promise((resolve, reject) => {
			const request = https.get(options, response => {
				let data = ''

				response.on('data', chunk => data += chunk)
				response.on('end', () => resolve(data))
			})

			request.on('error', error => reject(error))
		})

		scopes.then(data => {
			this.permissions = data
			console.log('Permissions', this.permissions)
		})
	}
}


