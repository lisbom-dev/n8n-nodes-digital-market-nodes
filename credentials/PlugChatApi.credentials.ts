import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties
} from 'n8n-workflow';

export class PlugChatApi implements ICredentialType {
	name = 'plugChatApi';
	displayName = 'PlugChat API';
	properties: INodeProperties[] = [
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Authorization': '={{$credentials.token}}',
			},
		},
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://www.plugchat.com.br/api',
			url: '/whatsapp/contacts',
		},
	};
}
