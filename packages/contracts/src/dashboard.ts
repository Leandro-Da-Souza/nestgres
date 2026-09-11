import {CurrencyTotal} from "./currency.js";
import {OrganizationSummary} from "./organization.js";
import {Invoice} from "./invoice.js";
import {ApiResponse} from "./api.js";

export type DashboardTotals = {
    organizations: number;
    invoices: number;
    activeUsers: number;
    amountsByCurrency: CurrencyTotal[]
}

export type DashboardData = {
    totals: DashboardTotals;
    organizations: OrganizationSummary[]
    recentInvoices: Invoice[]
}

export type DashboardResponse = ApiResponse<DashboardData>