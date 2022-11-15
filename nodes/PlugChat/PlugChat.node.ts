import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeParameters,
	INodeType,
	INodeTypeDescription
} from 'n8n-workflow';
import { groupFields, groupOperations } from './GroupDescription';
import { messageFields, messageOperations } from './MessageDescription';
import { plugChatApiRequest } from './PlugChatHelpers';

export class PlugChat implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Plug Chat',
		name: 'plugChat',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:plugchat.png',
		group: ['transform', 'digital-mkt'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create and edit data in PlugChat',
		defaults: {
			name: 'Plug Chat',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'plugChatApi',
				required: true,
			},
		],
		properties: [
			// ----------------------------------
			//         resources
			// ----------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				required: true,
				default: 'message',
				options: [
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'Group',
						value: 'group',
					},
				],
			},
			// ----------------------------------
			//         operations
			// ----------------------------------
			...messageOperations,
			...groupOperations,

			// ----------------------------------
			//         fields
			// ----------------------------------
			...messageFields,
			...groupFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		let resource: string;
		let operation: string;

		// For Post
		let body: IDataObject;
		// For Query string
		let qs: IDataObject;

		let requestMethod: string;
		let endpoint: string;
		// let returnAll = false;
		let dataKey: string | undefined;

		for (let i = 0; i < items.length; i++) {
			try {
				dataKey = undefined;
				resource = this.getNodeParameter('resource', 0) as string;
				operation = this.getNodeParameter('operation', 0) as string;

				requestMethod = 'GET';
				endpoint = '';
				body = {} as IDataObject;
				qs = {} as IDataObject;

				if (resource === 'message') {
					if (operation.includes('send')) {
						requestMethod = 'POST';
						endpoint = 'whatsapp/send-text';
						body = {
							phone: (this.getNodeParameter('phone', i) as string).replace(/\D/gm, ''),
							messageId: this.getNodeParameter('messageId', i) as string,
							delayMessage: this.getNodeParameter('delayMessage', i) as string,
						};
						if (operation === 'sendText' || operation === 'sendTextWithButtons') {
							body.message = this.getNodeParameter('message', i) as string;
						}
						if (operation === 'sendImage') {
							endpoint = 'whatsapp/send-image';
							body.image = this.getNodeParameter('mediaUrl', i) as string;
						}
						if (operation === 'sendVideo') {
							endpoint = 'whatsapp/send-video';
							body.video = this.getNodeParameter('mediaUrl', i) as string;
						}
						if (operation === 'sendAudio') {
							endpoint = 'whatsapp/send-audio';
							body.audio = this.getNodeParameter('mediaUrl', i) as string;
						}
						if (
							operation === 'sendImage' ||
							operation === 'sendVideo' ||
							operation === 'sendAudio'
						) {
							body.caption = this.getNodeParameter('caption', i) as string;
						}
						if (operation === 'sendTextWithButtons') {
							body.buttonList = {
								buttons: (this.getNodeParameter('buttons', i) as INodeParameters).buttons,
							};
							console.log(body.buttonsList);
						}
					}
				}
				if (resource === 'group') {
					if (operation === 'create') {
						requestMethod = 'POST';
						endpoint = 'whatsapp/create-group';
						body = {
							groupName: this.getNodeParameter('groupName', i) as string,
							phones: this.getNodeParameter('phones', i) as string,
						};
					}
				}
				let responseData;
				responseData = await plugChatApiRequest.call(
					this,
					requestMethod,
					endpoint,
					body,
					qs,
					dataKey,
				);
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}
		return this.prepareOutputData(returnData);
	}
}
