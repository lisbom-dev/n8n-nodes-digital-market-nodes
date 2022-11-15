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
	if (body.status === 'billet_printed') {
		return WebhookEventTypes.GENERATED_BILLET;
	}
	if (body.status === 'waiting_payment' && body.payment_type === 'pix') {
		return WebhookEventTypes.GENERATED_PIX;
	}
	if (body.status === 'approved' || body.status === 'completed') {
		return WebhookEventTypes.PURCHASE_APPROVED;
	}
	if (
		body.status === 'approved' &&
		(body.Subscription as IDataObject)?.subscription_status === 'inactive'
	) {
		return WebhookEventTypes.SUBSCRIPTION_LATE;
	}
	if (
		body.status === 'approved' &&
		(body.Subscription as IDataObject)?.subscription_status === 'active'
	) {
		return WebhookEventTypes.SUBSCRIPTION_RENEWED;
	}
	if (body.status === 'refused') {
		return WebhookEventTypes.PURCHASE_REFUSED;
	}
	if (body.status === 'refunded' || body.status === 'reversed') {
		return WebhookEventTypes.REFUND;
	}
	if (body.status === 'chargedback') {
		return WebhookEventTypes.REFUND;
	}
	return WebhookEventTypes.ABANDONED_CART;
}

export class EvermartTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Evermart Trigger',
		name: 'EvermartTrigger',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:evermart.png',
		subtitle: '={{$parameter["event"]}}',
		group: ['trigger', 'digital-mkt', 'platforms'],
		version: 1,
		description: 'Evermart Webhook Trigger',
		triggerPanel: {
			header: '',
			executionsHelp: {
				inactive:
					'Webhooks have two modes: test and production. and it allow us to integrate with evermart api.<br /> <br /> <b>Use test mode while you build your workflow</b>. Click the \'listen\' button, then make a request to the test URL. The executions will show up in the editor.<br /> <br /> <b>Use production mode to run your workflow automatically</b>. <a data-key="activate">Activate</a> the workflow, then make requests to the production URL. These executions will show up in the executions list, but not in the editor.',
				active:
					'Webhooks have two modes: test and production. <br /> <br /> <b>Use test mode while you build your workflow</b>. Click the \'listen\' button, then make a request to the test URL. The executions will show up in the editor.<br /> <br /> <b>Use production mode to run your workflow automatically</b>. Since the workflow is activated, you can make requests to the production URL. These executions will show up in the <a data-key="executions">executions list</a>, but not in the editor.',
			},
			activationHint:
				'Once you’ve finished building your workflow, run it without having to click this button by using the production webhook URL.',
		},
		defaults: {
			name: 'Evermart Trigger',
		},
		credentials: [
			{
				name: 'evermartApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'mkt/evermart',
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
		const credentials = await this.getCredentials('evermartApi');
		const res = this.getResponseObject();
		if (req.body.hottok !== credentials.hottok) {
			res.end('Invalid signature');
			return {
				noWebhookResponse: true,
			};
		}

		const event = getEvent.call(this);
		if (
			webhookEvents[event].value === this.getNodeParameter('event') ||
			this.getNodeParameter('event') === 'todos'
		) {
			return {
				workflowData: [this.helpers.returnJsonArray({ originalData: req.body, event })],
			};
		}
		return {
			noWebhookResponse: true,
		};
	}
}
