import {CurrencyTotal} from "./currency.js";

export type OrganizationSummary = {
    organizationId: number;
    organizationName: string;
    numberOfUsers: number;
    numberOfInvoices: number,
    amountsByCurrency: CurrencyTotal[]
}