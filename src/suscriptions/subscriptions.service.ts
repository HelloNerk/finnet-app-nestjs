import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Subscription } from './subscription.entity';
import { Plan } from './enums/plan.enum';
import { SubscriptionDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {

    constructor(
        @InjectRepository(Subscription)
        private subscriptionRepository: Repository<Subscription>
    ){}

    async createSubscription(subscriptionData: SubscriptionDto) {

        // First search if already exists an active subscription for the user
        const existingSubscription = await this.subscriptionRepository.findOne({
            where: { userId: subscriptionData.userId, isActive: true },
        });

        if (existingSubscription) {
            existingSubscription.isActive = false; // Deactivate the existing subscription
            await this.subscriptionRepository.save(existingSubscription); // Save the deactivated subscription
        }
        

        const finalSubscription: Subscription = new Subscription();

        if(!subscriptionData.userId) {
            throw new Error('User ID is required to create a subscription');
        }

        if(!subscriptionData.plan) {
            subscriptionData.plan = Plan.FREE;
        }

        if(subscriptionData.isActive === undefined) {
            subscriptionData.isActive = true;
        }

        finalSubscription.userId = subscriptionData.userId;
        finalSubscription.plan = subscriptionData.plan;
        finalSubscription.isActive = subscriptionData.isActive;
        
        switch (subscriptionData.plan) {
            case Plan.FREE:
                finalSubscription.expiresAt = null;
                break;
            case Plan.MONTHLY:
                finalSubscription.expiresAt = this.getMonthlyExpirationDate();
                break;
            case Plan.YEARLY:
                finalSubscription.expiresAt = this.getYearlyExpirationDate();
        }

        const newSubscription = this.subscriptionRepository.create(finalSubscription);
        return this.subscriptionRepository.save(newSubscription);
    }

    private getMonthlyExpirationDate(): Date {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date;
    }

    private getYearlyExpirationDate(): Date {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date;
    }


    findSubscriptionById(id: number) {
        return this.subscriptionRepository.findOne({
            where: { id },
            relations: ['user'],
        });
    }

    // findSubscriptionsByUserId(userId: number) {
    //     return this.subscriptionRepository.find({
    //         where: { userId },
    //         relations: ['user'],
    //     });
    // }

    // updateSubscription(id: number, updateData: Partial<Subscription>) {
    //     return this.subscriptionRepository.update(id, updateData);
    // }

    // deleteSubscription(id: number) {
    //     return this.subscriptionRepository.delete(id);
    // }

    // findActiveSubscriptions() {
    //     return this.subscriptionRepository.find({
    //         where: { isActive: true },
    //         relations: ['user'],
    //     });
    // }

    // findExpiredSubscriptions() {
    //     return this.subscriptionRepository.find({
    //         where: { expiresAt: LessThan(new Date()), isActive: true },
    //         relations: ['user'],
    //     });
    // }

    findActiveSubscriptionsByUserId(userId: number) {
        return this.subscriptionRepository.find({
            where: { userId, isActive: true },
            relations: ['user'],
        });
    }

    

}
