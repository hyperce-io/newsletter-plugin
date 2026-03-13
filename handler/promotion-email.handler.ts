import { EmailEventListener } from '@vendure/email-plugin';
import { PromotionCreatedEvent } from '../events/promotion-created.event';

export const newPromotionEmailHandler = new EmailEventListener('new-promotion-notification')
    .on(PromotionCreatedEvent)
    .setSubject('New Promotion Available!')
    .setFrom('abc@gmail.com')
    .setRecipient(event => event.email)
    .setTemplateVars(event => ({
        name: event.promotion.name,
        description: event.promotion.description,
        startDate: event.promotion.startDate,
        endDate: event.promotion.endDate,
        couponCode: event.promotion.couponCode,
    }));
