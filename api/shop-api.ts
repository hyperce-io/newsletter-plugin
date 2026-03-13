import gql from 'graphql-tag';

export const shopApiExtensions = gql`
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

    input NewsletterEntityOptions {
        take: Int
        skip: Int
        filter: NewsletterEntityFilter
    }
    input NewsletterEntityFilter {
        isSubscriptionConfirmed: Boolean
    }

    extend type Query {
        getAllSubscriptions(options: NewsletterEntityOptions): NewsletterEntityList!
        getUserSubscriptionById(id: String!): NewsletterEntity
    }
    extend type Mutation {
        addSubscription(email: String!, interests: [InterestType!]!): NewsletterEntity
        confirmSubscription(id: String!): NewsletterEntity
        removeSubscription(id: String!): String!
    }
`;
