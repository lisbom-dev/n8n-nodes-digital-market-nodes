export enum WebhookEventTypes {
	SUBSCRIPTION_LATE,
	SUBSCRIPTION_CANCELED,
	SUBSCRIPTION_RENEWED,
	GENERATED_BILLET,
	ABANDONED_CART,
	CHARGEBACK,
	PURCHASE_APPROVED,
	PURCHASE_REFUSED,
	GENERATED_PIX,
	REFUND,
}

export const webhookEvents = {
	[WebhookEventTypes.SUBSCRIPTION_LATE]: {
		name: 'Assinatura Atrasada',
		value: 'postback.assinatura.atrasada',
	},
	[WebhookEventTypes.SUBSCRIPTION_CANCELED]: {
		name: 'Assinatura Cancelada',
		value: 'postback.assinatura.cancelada',
	},
	[WebhookEventTypes.SUBSCRIPTION_RENEWED]: {
		name: 'Assinatura Renovada',
		value: 'postback.assinatura.renovada',
	},
	[WebhookEventTypes.GENERATED_BILLET]: {
		name: 'Boleto Gerado',
		value: 'postback.boleto.gerado',
	},
	[WebhookEventTypes.ABANDONED_CART]: {
		name: 'Carrinho Abandonado',
		value: 'postback.carrinho.abandonado',
	},
	[WebhookEventTypes.CHARGEBACK]: {
		name: 'Chargeback',
		value: 'postback.chargeback',
	},
	[WebhookEventTypes.PURCHASE_APPROVED]: {
		name: 'Compra Aprovada',
		value: 'postback.compra.aprovada',
	},
	[WebhookEventTypes.PURCHASE_REFUSED]: {
		name: 'Compra Recusada',
		value: 'postback.compra.recusada',
	},
	[WebhookEventTypes.GENERATED_PIX]: {
		name: 'Pix Gerado',
		value: 'postback.pix.gerado',
	},
	[WebhookEventTypes.REFUND]: {
		name: 'Reembolso',
		value: 'postback.reembolso',
	},
	all: {
		name: 'Todos',
		value: 'todos',
	},
};
