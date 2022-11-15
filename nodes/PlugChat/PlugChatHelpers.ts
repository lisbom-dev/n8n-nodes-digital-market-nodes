import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	NodeApiError
} from 'n8n-workflow';
import { OptionsWithUri } from 'request';

export async function plugChatApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: IDataObject,
	query?: IDataObject,
	dataKey?: string,
	// tslint:disable-next-line:no-any
): Promise<any> {
	if (query === undefined) {
		query = {};
	}

	const options: OptionsWithUri = {
		headers: {},
		method,
		qs: query,
		uri: `https://www.plugchat.com.br/api/${endpoint}`,
		json: true,
	};

	if (Object.keys(body).length !== 0) {
		options.body = body;
	}

	try {
		const responseData = await this.helpers.requestWithAuthentication.call(
			this,
			'plugChatApi',
			options,
		);

		if (responseData.success === false) {
			throw new NodeApiError(this.getNode(), responseData);
		}

		if (dataKey === undefined) {
			return responseData;
		} else {
			return responseData[dataKey] as IDataObject;
		}
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export enum WebhookEventTypes {
	DeliveryCallback,
	FinishAttendance,
	ReceivedCallback,
	StartAttendance,
	MessageStatus,
	DisconnectedCallback,
	PresenceChatCallback,
	ConnectedCallback,
}

export const webhookEvents = {
	[WebhookEventTypes.DeliveryCallback]: {},
};
