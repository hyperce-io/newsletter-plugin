# Newsletter Subscription Plugin

A Vendure plugin that lets storefront users subscribe to newsletters, confirm or remove their subscription, and get targeted updates when new products or promotions are published. It exposes a Shop API extension plus a set of email event listeners you can plug into @vendure/email-plugin.

## Features

- Newsletter entity persisted in the Vendure database with interest tagging and confirmation state.
- GraphQL mutations/queries for creating, confirming, deleting, and listing subscriptions.
- Email event fired on subscription so you can send double-opt-in and unsubscribe links.
- Product and promotion event listeners that fan out to interested subscribers (ready for queueing).
- Drop-in email handlers for newsletter confirmation, product launch, and promotion campaigns.

## Project Structure

| Path | Purpose |
| --- | --- |
| newsletter-plugin.ts | Registers the plugin, hooks product & promotion events, wires resolvers/services. |
| api/shop-api.ts | GraphQL schema extensions for the Shop API. |
| api/resolver/newsletter-shop.resolver.ts | GraphQL resolver that delegates to the service layer. |
| service/newsletter.service.ts | Business logic for CRUD, confirmation, list queries, and interest filtering. |
| entities/newslettersubscription.entity.ts | TypeORM entity persisted via Vendure. |
| events/*.ts | Strongly typed Vendure events for subscription, product, and promotion notifications. |
| handler/*.ts | Email event listeners usable with @vendure/email-plugin. |
| constant.ts | Injection token for passing plugin options through Nest's DI. |

## Installation

1. Copy the plugin into your Vendure project (e.g. src/plugins/newsletter-plugin).
2. Export the plugin module, then register it inside vendure-config.ts:

```ts
import { NewsletterSubscriptionPlugin } from './plugins/newsletter-plugin/newsletter-plugin';

export const config: VendureConfig = {
    // ...
    plugins: [
        NewsletterSubscriptionPlugin.init({
            frontendUrl: process.env.FRONTEND_URL ?? 'https://shop.example.com/',
        }),
    ],
};
```

3. Boot the Vendure server so TypeORM can run migrations for NewsletterEntity.

## Configuration

| Option | Required | Description |
| --- | --- | --- |
| frontendUrl | yes | Absolute base URL for generating confirmation & unsubscribe links. |

Environment variables used internally:

- FRONTEND_URL – fallback used when constructing confirmation/unsubscribe links in NewsletterService.
- SERVER_URL – referenced (commented) for building product image URLs when sending product emails.

## GraphQL API

The plugin extends the Shop API with the following types:

```graphql
type NewsletterEntity implements Node {
    id: ID!
    createdAt: DateTime!
    email: String!
    interests: [InterestType]!
    isSubscriptionConfirmed: Boolean!
}

enum InterestType {
    NEW_PROMOTIONS
    NEW_PRODUCTS
    NEW_CATEGORY
}

type NewsletterEntityList implements PaginatedList {
    items: [NewsletterEntity!]!
    totalItems: Int!
}
```

### Mutations

```graphql
mutation AddSubscription($email: String!, $interests: [InterestType!]!)
mutation ConfirmSubscription($id: String!)
mutation RemoveSubscription($id: String!)
```

### Queries

```graphql
query GetAllSubscriptions($options: NewsletterEntityOptions)
query GetUserSubscriptionById($id: String!)
```

Use options.filter.isSubscriptionConfirmed to fetch only verified subscribers.

## Email Events & Handlers

The service emits a NewsletterSubscriptionEvent once a user signs up. Hook the included email listener into the Vendure email plugin:

```ts
import { EmailPlugin } from '@vendure/email-plugin';
import { newsletterSubscriptionHandler } from './plugins/newsletter-plugin/handler/newsletter-subscription.handler';

EmailPlugin.init({
    handlers: [newsletterSubscriptionHandler],
});
```

Additional handlers exist for ProductCreatedEvent and PromotionCreatedEvent. They use InterestType.NEW_PRODUCTS and InterestType.NEW_PROMOTIONS respectively to determine recipients. The actual ProductCreatedEvent email publishing is stubbed out in the plugin entry point—wire it into a job queue or send directly once you're ready.

## Development Notes

- All database writes run inside Vendure's TransactionalConnection, so remember to pass the RequestContext from resolvers.
- Interest filtering is done with a Postgres array overlap (&&)—ensure your DB supports it.
- Logging statements currently print subscribers and promotion payloads; remove or refine them for production.
- The product email handler expects price to be normalized; adjust the sample mapping in newsletter-plugin.ts before enabling.

## Future Ideas

- Move product/promotion email fan-out into Vendure's Job Queue for better throughput.
- Add rate limiting and resend windows for confirmation emails.
- Provide an Admin UI widget for managing subscribers without GraphQL.

## License

MIT (or align with your main project licensing).
