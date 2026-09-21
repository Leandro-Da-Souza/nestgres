import { CurrencyTotal } from "./currency.js";
import {ApiResponse} from "./api.js";

export type OrganizationPlan = 'free' | 'pro' | 'enterprise'

export type Organization = {
    id: number,
    name: string,
    plan: OrganizationPlan,
    countryCode: string,
    createdAt: string | null
}

export type OrganizationSummary = {
    organizationId: number;
    organizationName: string;
    numberOfUsers: number;
    numberOfInvoices: number,
    amountsByCurrency: CurrencyTotal[]
}

export type OrganizationsResponse = ApiResponse<Organization[]>
