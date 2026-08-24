export const ORGANIZATION_PLANS = ['free', 'pro', 'enterprise'] as const;

export type OrganizationPlan = (typeof ORGANIZATION_PLANS)[number];

export type OrganizationType = {
  id: number;
  name: string;
  plan: OrganizationPlan;
  countryCode: string;
  createdAt: Date | null;
};
