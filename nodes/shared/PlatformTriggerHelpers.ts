import { IWebhookFunctions, IWebhookResponseData } from 'n8n-workflow';
import { WebhookEventTypes } from './WebhookEvents';

export abstract class AbstractPlatformTrigger {
	abstract platformWebhook(
		this: IWebhookFunctions,
		event: WebhookEventTypes,
	): Promise<IWebhookResponseData>;
	abstract getEvent(self: IWebhookFunctions): WebhookEventTypes;
}
