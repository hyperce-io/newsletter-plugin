import { RequestContext, VendureEvent } from '@vendure/core';

export interface ProductCreatedEventInput {
    name: string;
    description: string;
    price: number;
    photo: string;
}

export class ProductCreatedEvent extends VendureEvent {
    constructor(
        public ctx: RequestContext,
        public product: ProductCreatedEventInput,
        public email: string,
    ) {
        super();
    }
}
