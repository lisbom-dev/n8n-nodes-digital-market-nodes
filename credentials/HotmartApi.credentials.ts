import {
	ICredentialType,
	INodeProperties
} from 'n8n-workflow';

export class HotmartApi implements ICredentialType {
	name = 'hotmartApi';
	displayName = 'Hotmart API';
	properties: INodeProperties[] = [
		{
			displayName: 'Hottok',
			name: 'hottok',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];
}
