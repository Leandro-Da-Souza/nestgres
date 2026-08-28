export type OrganizationSummaryType = {
  organizationId: number;
  organizationName: string;
  numberOfUsers: number;
  numberOfInvoices: number;
  // keep amounts below as strings, JS can introduce inaccuracies for floating point numbers
  totalInvoiceAmount: string;
  outstandingAmount: string;
};
