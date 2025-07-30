import { IsEnum } from "class-validator";
import { Plan } from "../enums/plan.enum";

export class SubscriptionDto{
    userId: number;

    @IsEnum(Plan)
    plan: Plan;


    isActive: boolean;
}
