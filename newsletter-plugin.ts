import {
    RequestContext,
    EventBus,
    PluginCommonModule,
    ProductEvent,
    VendurePlugin,
    EntityHydrator,
    PromotionEvent,
} from '@vendure/core';
import { NewsletterEntity } from './entities/newslettersubscription.entity';
import { NewsletterResolver } from './api/resolver/newsletter-shop.resolver';
import { NewsletterService } from './service/newsletter.service';
import { shopApiExtensions } from './api/shop-api';
import { NEWSLETTER_SUBSCRIPTION_PLUGIN_OPTIONS } from './constant';
import { OnModuleInit } from '@nestjs/common';
import { ProductCreatedEvent, ProductCreatedEventInput } from './events/product-created.event';
//@ts-ignore
import { InterestType } from '../../codegen/shopTypes';
import { PromotionCreatedEvent, PromotionCreatedEventInput } from './events/promotion-created.event';

export interface NewsletterSubscriptionPluginOptions {
    frontendUrl: string;
}

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [
        NewsletterService,
        {
            provide: NEWSLETTER_SUBSCRIPTION_PLUGIN_OPTIONS,
            useFactory: () => NewsletterSubscriptionPlugin.options,
        },
    ],
    entities: [NewsletterEntity],
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [NewsletterResolver],
    },
    configuration: config => {
        return config;
    },
})
export class NewsletterSubscriptionPlugin implements OnModuleInit {
    constructor(
        private eventBus: EventBus,
        private newsletterService: NewsletterService,
        private entityHydrator: EntityHydrator,
    ) {}

    async onModuleInit() {
        this.eventBus.ofType(ProductEvent).subscribe(async event => {
            if (event.type != 'created') {
                return;
            }
            const usersWithProductInterest = await this.newsletterService.getSubscribedUserEmailsByInterest(
                event.ctx,
                [InterestType.NEW_PRODUCTS],
            );
            await this.entityHydrator.hydrate(event.ctx, event.entity, {
                relations: ['variants', 'featuredAsset'],
            });
            console.log(event.entity);
            // const mailProduct: ProductCreatedEventInput = {
            //     name: event.entity.translations[0].name,
            //     description: event.entity.translations[0].description,
            //     //@ts-ignore
            //     price: event.entity.customFields.price / 100,
            //     photo: `${process.env.SERVER_URL}/assets/${event.entity.featuredAsset.preview}`,
            // };
            // console.log(mailProduct);
            // // :Todo move this to job queue (Rahul)
            // usersWithProductInterest.forEach(mail => {
            //     this.eventBus.publish(new ProductCreatedEvent(event.ctx, mailProduct, mail));
            // });
        });
        this.eventBus.ofType(PromotionEvent).subscribe(async event => {
            if (event.type != 'created') {
                return;
            }
            const usersWithProductInterest = await this.newsletterService.getSubscribedUserEmailsByInterest(
                event.ctx,
                [InterestType.NEW_PROMOTIONS],
            );

            const mailPromotion: PromotionCreatedEventInput = {
                name: event.entity.translations[0].name,
                couponCode: event.entity.couponCode,
                description: event.entity.translations[0].description,
                startDate: event.entity.startsAt?.toDateString() || 'Promotion Started Already',
                endDate:
                    event.entity.endsAt?.toDateString() || 'Promotion Valid till Seller has it activated',
            };
            console.log(mailPromotion);
            // :Todo move this to job queue (Rahul)
            usersWithProductInterest.forEach(mail => {
                this.eventBus.publish(new PromotionCreatedEvent(event.ctx, mailPromotion, mail));
            });
        });
    }
    static options: NewsletterSubscriptionPluginOptions;
    static init(options: NewsletterSubscriptionPluginOptions) {
        NewsletterSubscriptionPlugin.options = options;
        return NewsletterSubscriptionPlugin;
    }
}
