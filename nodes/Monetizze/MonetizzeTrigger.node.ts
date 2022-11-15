import type {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData
} from 'n8n-workflow';
import { webhookEvents, WebhookEventTypes } from '../shared/WebhookEvents';

function getEvent(this: IWebhookFunctions): WebhookEventTypes {
	const body = this.getBodyData() as IDataObject & Record<string, IDataObject>;

	if (
		(body.tipoPostback.codigo === '99' && body.venda.status === 'Aguardando pagamento') ||
		(body.tipoPostback.codigo === '1' && body.venda.formaPagamento === 'Boleto') ||
		(body.venda.codigo_status === '1' && body.venda.formaPagamento === 'Boleto')
	) {
		return WebhookEventTypes.GENERATED_BILLET;
	}

	if (
		body.tipoPostback.codigo === '1' &&
		(!!body.pix_url || !!body.pix_imagem_qrcode || !!body.pix_codigo_qrcode)
	) {
		return WebhookEventTypes.GENERATED_PIX;
	}

	if (body.tipoPostback.codigo === '2') {
		return WebhookEventTypes.PURCHASE_APPROVED;
	}

	if (body.tipoPostback.codigo === '102') {
		return WebhookEventTypes.SUBSCRIPTION_LATE;
	}

	if (body.tipoPostback.codigo === '101') {
		return WebhookEventTypes.SUBSCRIPTION_RENEWED;
	}

	if (body.tipoPostback.codigo === '3') {
		return WebhookEventTypes.PURCHASE_REFUSED;
	}

	if (body.tipoPostback.codigo === '4') {
		return WebhookEventTypes.REFUND;
	}

	return WebhookEventTypes.ABANDONED_CART;
}

export class MonetizzeTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Monetizze Trigger',
		name: 'MonetizzeTrigger',
		icon: 'file:monetizze.svg',
		subtitle: '={{$parameter["event"]}}',
		group: ['trigger', 'digital-mkt', 'platforms'],
		version: 1,
		description: 'Monetizze Webhook Trigger',
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
			name: 'Monetizze Trigger',
		},
		credentials: [
			{
				name: 'monetizzeApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				isFullPath: true,
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'mkt/monetizze',
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
		const credentials = await this.getCredentials('monetizzeApi');
		const res = this.getResponseObject();

		if (req.body.chave_unica !== credentials.token) {
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
		res.end('Invalid event');
		return {
			noWebhookResponse: true,
		};
	}
}
