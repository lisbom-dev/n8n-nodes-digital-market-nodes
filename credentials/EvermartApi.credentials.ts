import {
	ICredentialType,
	INodeProperties
} from 'n8n-workflow';

export class EvermartApi implements ICredentialType {
	name = 'evermartApi';
	displayName = 'Evermart API';
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
