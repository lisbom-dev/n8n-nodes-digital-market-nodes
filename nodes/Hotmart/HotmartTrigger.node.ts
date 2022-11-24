import {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData
} from 'n8n-workflow';
import { webhookEvents, WebhookEventTypes } from '../shared/WebhookEvents';

function getEvent(this: IWebhookFunctions): WebhookEventTypes | undefined {
	const body = this.getBodyData() as IDataObject & Record<string, IDataObject>;

	if (body.event === 'PURCHASE_CANCELED'){
		return WebhookEventTypes.PURCHASE_CANCELED;
	}

	if (body.event === 'PURCHASE_COMPLETE'){
		return WebhookEventTypes.PURCHASE_COMPLETED;
	}

	if (body.event === 'PURCHASE_PENDING'){
		return WebhookEventTypes.GENERATED_BILLET;
	}

	if (body.event === 'PURCHASE_CHARGEBACK'){
		return WebhookEventTypes.CHARGEBACK;
	}

	if (body.event === 'PURCHASE_REFUNDED'){
		return WebhookEventTypes.REFUND;
	}

	if (body.event === 'PURCHASE_APPROVED'){
		return WebhookEventTypes.PURCHASE_APPROVED;
	}

	if (body.event === 'PURCHASE_EXPIRED'){
		return WebhookEventTypes.PURCHASE_CANCELED;
	}

	if (body.event === 'PURCHASE_APPROVED'){
		return WebhookEventTypes.PURCHASE_APPROVED;
	}

	if (body.event === 'PURCHASE_DELAYED'){
		return WebhookEventTypes.SUBSCRIPTION_LATE;
	}

	if (body.event === 'PURCHASE_PROTEST'){
		return WebhookEventTypes.PURCHASE_PROTEST;
	}

	if (body.event === 'SUBSCRIPTION_CANCELLATION'){
		return WebhookEventTypes.SUBSCRIPTION_CANCELED;
	}

	if (body.event === 'SWITCH_PLAN'){
		return WebhookEventTypes.SUBSCRIPTION_RENEWED;
	}

	if (body.event === 'PURCHASE_OUT_OF_SHOPPING_CART'){
		return WebhookEventTypes.ABANDONED_CART;
	}

	return;
}

export class HotmartTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Hotmart Trigger',
		name: 'HotmartTrigger',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:hotmart.png',
		subtitle: '={{$parameter["event"]}}',
		group: ['trigger', 'digital-mkt', 'platforms'],
		version: 1,
		description: 'Hotmart Webhook Trigger',
		triggerPanel: {
			header:'',
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
			name: 'Hotmart Trigger',
		},
		credentials: [
			{
				name: 'hotmartApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				isFullPath: true,
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'mkt/hotmart',
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
		const credentials = await this.getCredentials('hotmartApi');
		const res = this.getResponseObject();

		if (req.headers['x-hotmart-hottok'] !== credentials.hottok) {
			res.status(401).send('Invalid signature');
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
				workflowData: [this.helpers.returnJsonArray({ originalData: req.body, event})],
			};
		}

		return {
			noWebhookResponse: true,
		};
	}
}
