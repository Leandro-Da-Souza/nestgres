import { CurrencyTotal } from '@nestgres/contracts';

export const CURRENCIES = ['SEK', 'EUR', 'USD'] as const;
export type CurrencyType = (typeof CURRENCIES)[number];

export type OrganizationCurrencyType = CurrencyTotal & {
  organizationId: number;
};
