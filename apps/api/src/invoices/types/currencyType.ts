export const CURRENCIES = ['SEK', 'EUR', 'USD'] as const;
export type CurrencyType = (typeof CURRENCIES)[number];

export type CurrencyTotalType = {
  currency: CurrencyType;
  // keep amounts below as strings, JS can introduce inaccuracies for floating point numbers
  totalInvoiceAmount: string;
  totalOutstandingAmount: string;
};

export type OrganizationCurrencyType = CurrencyTotalType & {
  organizationId: number;
};
