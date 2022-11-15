import {
	ICredentialType,
	INodeProperties
} from 'n8n-workflow';

export class KiwifyApi implements ICredentialType {
	name = 'kiwifyApi';
	displayName = 'Kiwify API';
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
}
