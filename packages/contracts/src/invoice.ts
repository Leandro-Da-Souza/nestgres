import {Currency} from "./currency.js";

export type InvoiceStatus = "open" | "paid" | "overdue" | "void"

export type Invoice = {
    id: number;
    organizationId: number;
    amount: string;
    currency: Currency;
    status: InvoiceStatus;
    issuedOn: string;
    dueOn: string;
    paidAt: string | null;
    createdAt: string;
}