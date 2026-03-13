import { Entity, Column } from 'typeorm';
import { VendureEntity, DeepPartial } from '@vendure/core';

@Entity()
export class NewsletterEntity extends VendureEntity {
    constructor(input?: DeepPartial<NewsletterEntity>) {
        super(input);
    }

    @Column()
    email: string;

    @Column('text', { array: true, nullable: true })
    interests: string[];

    @Column({ default: false })
    isSubscriptionConfirmed: boolean;
}
