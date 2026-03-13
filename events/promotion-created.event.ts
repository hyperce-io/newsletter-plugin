import { RequestContext, VendureEvent } from '@vendure/core';

export interface PromotionCreatedEventInput {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    couponCode: string;
}
export class PromotionCreatedEvent extends VendureEvent {
    constructor(
        public ctx: RequestContext,
        public promotion: PromotionCreatedEventInput,
        public email: string,
    ) {
        super();
    }
}
