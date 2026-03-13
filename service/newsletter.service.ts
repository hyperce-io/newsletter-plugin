import { Injectable, Inject } from '@nestjs/common';
import {
    RequestContext,
    TransactionalConnection,
    EventBus,
    UserInputError,
    ListQueryBuilder,
    Product,
} from '@vendure/core';
import { NewsletterEntity } from '../entities/newslettersubscription.entity';
import { NewsletterSubscriptionEvent } from '../events/newsletter-subscription-event';
import { NewsletterSubscriptionPluginOptions } from '../newsletter-plugin';
import { NEWSLETTER_SUBSCRIPTION_PLUGIN_OPTIONS } from '../constant';
import { ListQueryOptions, PaginatedList } from '@vendure/core';
import { In } from 'typeorm';
import { InterestType } from 'src/codegen/shopTypes';
import { ProductCreatedEvent } from '../events/product-created.event';

@Injectable()
export class NewsletterService {
    constructor(
        private connection: TransactionalConnection,
        private eventBus: EventBus,
        private listQueryBuilder: ListQueryBuilder,
        @Inject(NEWSLETTER_SUBSCRIPTION_PLUGIN_OPTIONS)
        private options: NewsletterSubscriptionPluginOptions,
    ) {}

    async addSubscription(ctx: RequestContext, email: string, interests: string[]) {
        const existingSubscription = await this.connection.getRepository(ctx, NewsletterEntity).findOne({
            where: { email },
        });

        if (existingSubscription) {
            throw new Error('A subscription with this email already exists.');
        }

        const newSubscription = this.connection.getRepository(ctx, NewsletterEntity).create({
            email,
            interests,
            isSubscriptionConfirmed: false,
        });
        const savedSubscription = await this.connection
            .getRepository(ctx, NewsletterEntity)
            .save(newSubscription);
        const acceptLink = `${process.env.FRONTEND_URL}newsletter/verify?id=${savedSubscription.id}`;
        const unsubscribeLink = `${process.env.FRONTEND_URL}newsletter/unsubscribe?id=${savedSubscription.id}`;

        this.eventBus.publish(
            new NewsletterSubscriptionEvent(ctx, {
                email: savedSubscription.email,
                acceptLink: acceptLink,
                unsubscribeLink: unsubscribeLink,
            }),
        );

        return savedSubscription;
    }

    async confirmSubscription(ctx: RequestContext, id: string) {
        const repository = this.connection.getRepository(ctx, NewsletterEntity);
        const subscription = await repository.findOne({ where: { id } });

        if (!subscription) {
            throw new Error('Subscription not found.');
        }

        subscription.isSubscriptionConfirmed = true;
        const updatedSubscription = await repository.save(subscription);
        return updatedSubscription;
    }

    async removeSubscription(ctx: RequestContext, id: string) {
        const repository = this.connection.getRepository(ctx, NewsletterEntity);
        const subscription = await repository.findOne({ where: { id } });

        if (!subscription) {
            throw new Error(`Subscription with ID ${id} not found.`);
        }

        await repository.remove(subscription);
        return `Subscription with ID ${id} was removed successfully.`;
    }

    async getAllSubscriptions(
        ctx: RequestContext,
        options?: ListQueryOptions<NewsletterEntity>,
    ): Promise<PaginatedList<NewsletterEntity>> {
        const query = this.listQueryBuilder.build(NewsletterEntity, options, { ctx });

        const [items, totalItems] = await query.getManyAndCount();

        return { items, totalItems };
    }
    async getUserSubscriptionById(ctx: RequestContext, id: string): Promise<NewsletterEntity> {
        const subscription = await this.connection
            .getRepository(ctx, NewsletterEntity)
            .findOne({ where: { id } });
        if (!subscription) {
            throw new UserInputError(`Newsletter subscription with id ${id} not found.`);
        }
        return subscription;
    }

    async getSubscribedUserEmailsByInterest(
        ctx: RequestContext,
        interests: InterestType[],
    ): Promise<string[]> {
        const subscribers = await this.connection
            .getRepository(ctx, NewsletterEntity)
            .createQueryBuilder('n')
            .where('n.isSubscriptionConfirmed = :confirmed', { confirmed: true })
            .andWhere('n.interests && :i', { i: interests })
            .select('n.email')
            .getMany();

        console.log(subscribers);
        const emailAddresses = subscribers.map(subscriber => subscriber.email);
        return emailAddresses;
    }
}
