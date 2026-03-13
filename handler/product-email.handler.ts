import { EmailEventListener } from '@vendure/email-plugin';
import { ProductCreatedEvent } from '../events/product-created.event';

export const newProductEmailHandler = new EmailEventListener('new-product-notification')
    .on(ProductCreatedEvent)
    .setSubject('New Product Available!')
    .setRecipient(event => event.email)
    .setFrom('abc@gmail.com')
    .setTemplateVars(event => ({
        name: event.product.name,
        description: event.product.description,
        price: event.product.price,
        photo: event.product.photo,
    }));
