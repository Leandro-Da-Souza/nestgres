export type Currency = 'EUR' | 'SEK' | 'USD';

export type CurrencyTotal = {
    currency: Currency,
    totalInvoiceAmount: string;
    totalOutstandingAmount: string;
}
