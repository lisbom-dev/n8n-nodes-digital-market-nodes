import crypto from 'crypto';
import {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData
} from 'n8n-workflow';
import { webhookEvents, WebhookEventTypes } from '../shared/WebhookEvents';

function getEvent(this: IWebhookFunctions): WebhookEventTypes {
	const body = this.getBodyData();
	if (body.order_status === 'waiting_payment' && body.payment_method === 'boleto') {
		return WebhookEventTypes.GENERATED_BILLET;
	}
	if (body.order_status === 'waiting_payment' && body.payment_method === 'pix') {
		return WebhookEventTypes.GENERATED_PIX;
	}
	if (body.order_status === 'paid') {
		return WebhookEventTypes.PURCHASE_APPROVED;
	}
	if (
		body.order_status === 'paid' &&
		(body.Subscription as IDataObject)?.status === 'waiting_payment'
	) {
		return WebhookEventTypes.SUBSCRIPTION_LATE;
	}
	if (body.order_status === 'paid' && (body.Subscription as IDataObject)?.status === 'active') {
		return WebhookEventTypes.SUBSCRIPTION_RENEWED;
	}
	if (body.order_status === 'refused') {
		return WebhookEventTypes.PURCHASE_REFUSED;
	}
	if (body.order_status === 'refunded') {
		return WebhookEventTypes.REFUND;
	}
	if (body.order_status === 'chargedback') {
		return WebhookEventTypes.REFUND;
	}
	return WebhookEventTypes.ABANDONED_CART;
}

export class KiwifyTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Kiwify Trigger',
		name: 'KiwifyTrigger',
		icon: 'file:kiwify.svg',
		subtitle: '={{$parameter["event"]}}',
		group: ['trigger', 'digital-mkt', 'platforms'],
		version: 1,
		description: 'Kiwify Webhook Trigger',
		triggerPanel: {
			header: '',
			executionsHelp: {
				inactive:
					'Webhooks have two modes: test and production. <br /> <br /> <b>Use test mode while you build your workflow</b>. Click the \'listen\' button, then make a request to the test URL. The executions will show up in the editor.<br /> <br /> <b>Use production mode to run your workflow automatically</b>. <a data-key="activate">Activate</a> the workflow, then make requests to the production URL. These executions will show up in the executions list, but not in the editor.',
				active:
					'Webhooks have two modes: test and production. <br /> <br /> <b>Use test mode while you build your workflow</b>. Click the \'listen\' button, then make a request to the test URL. The executions will show up in the editor.<br /> <br /> <b>Use production mode to run your workflow automatically</b>. Since the workflow is activated, you can make requests to the production URL. These executions will show up in the <a data-key="executions">executions list</a>, but not in the editor.',
			},
			activationHint:
				'Once you’ve finished building your workflow, run it without having to click this button by using the production webhook URL.',
		},
		defaults: {
			name: 'Kiwify Trigger',
		},
		credentials: [
			{
				name: 'kiwifyApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				isFullPath: true,
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'mkt/kiwify',
			},
		],
		inputs: [],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: '',
				options: Object.values(webhookEvents),
			},
		],
	};
	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const credentials = await this.getCredentials('kiwifyApi');
		const res = this.getResponseObject();
		const order = this.getBodyData();
		const calculatedSignature = crypto
			.createHmac('sha1', credentials.token as string)
			.update(JSON.stringify(order))
			.digest('hex');

		if (req.query.signature !== calculatedSignature) {
			res.end('Invalid signature');
			return {
				noWebhookResponse: true,
			};
		}

		const event = getEvent.call(this);
		if (
			event &&
			(webhookEvents[event].value === this.getNodeParameter('event') ||
			this.getNodeParameter('event') === 'todos')
		) {
			return {
				workflowData: [this.helpers.returnJsonArray({ originalData: req.body, event })],
			};
		}
		res.end('Invalid event');
		return {
			noWebhookResponse: true,
		};
	}
}
