import { EmailEventListener } from '@vendure/email-plugin';
import { NewsletterSubscriptionEvent } from '../events/newsletter-subscription-event';

export const newsletterSubscriptionHandler = new EmailEventListener('newsletter-subscription')
    .on(NewsletterSubscriptionEvent)
    .setRecipient(event => event.input.email)
    .setSubject(`New Newsletter Subscription`)
    .setFrom('abc@gmail.com')
    .setTemplateVars(event => ({
        email: event.input.email,
        acceptLink: event.input.acceptLink,
        unsubscribeLink: event.input.unsubscribeLink,
    }));
