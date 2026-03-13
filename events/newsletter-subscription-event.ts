import { RequestContext, VendureEvent } from '@vendure/core';
interface NewsletterSubscriptionEventInput {
    email: string;
    acceptLink: string;
    unsubscribeLink: string;
}
export class NewsletterSubscriptionEvent extends VendureEvent {
    constructor(
        public ctx: RequestContext,
        public input: NewsletterSubscriptionEventInput,
    ) {
        super();
    }
}
