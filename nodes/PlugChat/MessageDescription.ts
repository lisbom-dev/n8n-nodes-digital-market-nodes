import { INodeProperties } from 'n8n-workflow';

export const messageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['message'],
			},
		},
		options: [
			{
				name: 'Send Audio',
				value: 'sendAudio',
				description: 'Sends Audio to Whatsapp',
				action: 'Send audio',
			},
			{
				name: 'Send Image',
				value: 'sendImage',
				description: 'Sends Image to Whatsapp',
				action: 'Send image',
			},
			{
				name: 'Send Text',
				value: 'sendText',
				description: 'Sends Text to Whatsapp',
				action: 'Send text',
			},
			{
				name: 'Send Text with Buttons',
				value: 'sendTextWithButtons',
				description: 'Sends Text with Buttons to Whatsapp',
				action: 'Send text with buttons',
			},
			{
				name: 'Send Video',
				value: 'sendVideo',
				description: 'Sends Video to Whatsapp',
				action: 'Send video',
			},
		],
		default: 'sendText',
	},
];

export const messageFields: INodeProperties[] = [
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		default: '',
		required: true,
		description: 'Phone number with country code',
		displayOptions: {
			show: {
				resource: ['message'],
			},
		},
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		default: '',
		required: true,
		description: 'Message to send',
		displayOptions: {
			show: {
				operation: ['sendText', 'sendTextWithButtons'],
				resource: ['message'],
			},
		},
	},
	{
		displayName: 'Media URL',
		name: 'mediaUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL or Base64 of the media to send',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['sendImage', 'sendAudio', 'sendVideo'],
			},
		},
	},
	{
		displayName: 'Caption',
		name: 'caption',
		type: 'string',
		default: '',
		description: 'Caption for media',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['sendImage', 'sendAudio', 'sendVideo'],
			},
		},
	},
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		default: '',
		description: 'Message ID to reply to',
		displayOptions: {
			show: {
				resource: ['message'],
			},
		},
	},
	{
		displayName: 'Delay',
		name: 'delayMessage',
		type: 'number',
		description: 'Delay in seconds',
		default: 0,
		displayOptions: {
			show: {
				resource: ['message'],
			},
		},
	},
	{
		displayName: 'Buttons',
		name: 'buttons',
		type: 'fixedCollection',
		placeholder: 'Add Button',
		default: [],
		required: true,
		typeOptions: {
			multipleValues: true,
		},
		description: 'A list with buttons to send with the message',
		displayOptions: {
			show: {
				operation: ['sendTextWithButtons'],
				resource: ['message'],
			},
		},
		options: [
			{
				name: 'buttons',
				displayName: 'Button List',
				description: 'List of buttons with id and label',
				values: [
					{
						displayName: 'ID',
						name: 'id',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Label',
						name: 'label',
						type: 'string',
						default: '',
					},
				],
			},
		],
	},
];
