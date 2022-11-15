import { INodeProperties } from 'n8n-workflow';

export const groupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['group'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a group',
				action: 'Create',
			},
		],
		default: 'create',
	},
];

export const groupFields: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'groupName',
		type: 'string',
		default: '',
		required: true,
		description: 'Group name',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Phones',
		name: 'phones',
		type: 'fixedCollection',
		placeholder: 'Add Phone',
		default: [],
		required: true,
		description: 'A list with all the phone numbers to add to the group',
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['group'],
			},
		},
		typeOptions: {
			multipleValues: true,
		},
		options: [
			{
				name: 'phoneValues',
				displayName: 'Phones',
				description: 'Phone number with country code',
				values: [
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
					},
				],
			},
		],
	},
];
