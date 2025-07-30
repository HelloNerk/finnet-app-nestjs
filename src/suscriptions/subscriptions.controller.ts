import { Controller, Post } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from './subscription.entity';
import { SubscriptionDto } from './dto/subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
    
    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    @Post('create')
    createSubscription(subscriptionData: SubscriptionDto) {
        return this.subscriptionsService.createSubscription(subscriptionData);
    }
}
