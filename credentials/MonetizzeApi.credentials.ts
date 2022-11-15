import {
	ICredentialType,
	INodeProperties
} from 'n8n-workflow';

export class MonetizzeApi implements ICredentialType {
	name = 'monetizzeApi';
	displayName = 'Monetizze API';
	properties: INodeProperties[] = [
		{
			displayName: 'Chave única',
			name: 'token',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];
}
