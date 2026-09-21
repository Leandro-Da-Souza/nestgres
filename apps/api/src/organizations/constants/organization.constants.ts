import type { OrganizationPlan } from '@nestgres/contracts';

export const ORGANIZATION_PLANS = [
  'free',
  'pro',
  'enterprise',
] as const satisfies readonly OrganizationPlan[];
