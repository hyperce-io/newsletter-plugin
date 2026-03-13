import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { NewsletterService } from '../../service/newsletter.service';
import { NewsletterEntity } from '../../entities/newslettersubscription.entity';
import { RequestContext, Ctx, PaginatedList } from '@vendure/core';
import { InterestType } from 'src/codegen/shopTypes';

@Resolver()
export class NewsletterResolver {
    constructor(private newsletterService: NewsletterService) {}

    // Add a newsletter subscription
    @Mutation()
    async addSubscription(
        @Ctx() ctx: RequestContext,
        @Args('email') email: string,
        @Args('interests', { type: () => [String] }) interests: string[],
    ): Promise<NewsletterEntity> {
        return this.newsletterService.addSubscription(ctx, email, interests);
    }
    //

    // Confirm a newsletter subscription
    @Mutation()
    async confirmSubscription(@Ctx() ctx: RequestContext, @Args('id') id: string): Promise<NewsletterEntity> {
        return this.newsletterService.confirmSubscription(ctx, id);
    }

    // Remove a newsletter subscription
    @Mutation()
    async removeSubscription(@Ctx() ctx: RequestContext, @Args('id') id: string): Promise<boolean> {
        await this.newsletterService.removeSubscription(ctx, id);
        return true;
    }

    // Get all newsletter subscriptions
    @Query()
    async getAllSubscriptions(
        @Ctx() ctx: RequestContext,
        @Args() args: any,
    ): Promise<PaginatedList<NewsletterEntity>> {
        return this.newsletterService.getAllSubscriptions(ctx, { ...args.options });
    }

    // Get the current user's newsletter subscription by Id
    @Query()
    async getUserSubscriptionById(
        @Ctx() ctx: RequestContext,
        @Args('id') id: string,
    ): Promise<NewsletterEntity | null> {
        return this.newsletterService.getUserSubscriptionById(ctx, id);
    }
}
