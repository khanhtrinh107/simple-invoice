export interface CustomerAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface CustomerContact {
  email: string;
  phone?: string;
  name?: string;
}

export interface Customer {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  contact?: CustomerContact;
  address?: CustomerAddress;
}

export interface BankAccount {
  bankName?: string;
  accountNumber?: string;
  routingCode?: string;
  accountHolderName?: string;
  swiftCode?: string;
  iban?: string;
}

export interface Document {
  id?: string;
  name: string;
  url: string;
  type?: string;
}

export interface CustomField {
  label: string;
  value: string;
}

export interface Extension {
  id?: string;
  name: string;
  data?: Record<string, unknown>;
}

export interface InvoiceItem {
  id?: string;
  name?: string;
  description?: string;
  quantity?: number;
  rate?: number;
  amount?: number;
  itemOrder?: number;
}

export type InvoiceStatus =
  | "Due"
  | "Overdue"
  | "Paid"
  | "Cancelled"
  | "Rejected";

export interface StatusObject {
  key: string;
  value?: string | boolean;
}

export type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CNY"
  | "AUD"
  | "CAD"
  | "CHF"
  | "HKD"
  | "SGD"
  | "INR"
  | "IDR"
  | "MYR"
  | "THB"
  | "PHP"
  | "VND";

export type SortOrder = "ASCENDING" | "DESCENDING";

export interface Invoice {
  id: string;
  invoiceId?: string;
  invoiceNumber: string;
  invoiceReference?: string;
  referenceNo?: string;
  status: StatusObject[];
  subStatus?: StatusObject[];
  type?: string;
  version?: string;
  currency: Currency;
  currencySymbol?: string;
  invoiceSubTotal?: number;
  totalDiscount?: number;
  totalTax?: number;
  invoiceGrossTotal?: number;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  totalPaid?: number;
  balanceAmount?: number;
  description?: string;
  invoiceDate: string;
  dueDate: string;
  customer: Customer;
  merchant?: {
    id: string;
    name: string;
    addresses?: CustomerAddress[];
  };
  bankAccount?: BankAccount;
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  documents?: Document[];
  customFields?: CustomField[];
  extensions?: Extension[];
  numberOfDocuments?: number;
  payments?: Array<{
    id?: string;
    amount?: number;
    paymentDate?: string;
    [key: string]: unknown;
  }>;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface InvoiceListParams {
  keyword?: string;
  status?: InvoiceStatus;
  ordering?: SortOrder;
  pageNum?: number;
  pageSize?: number;
}

export interface InvoiceListResponse {
  data: Invoice[];
  total: number;
  pageNum: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateInvoicePayload {
  invoiceNumber: string;
  customer: Customer;
  bankAccount?: BankAccount;
  items: InvoiceItem[];
  invoiceDate: string;
  dueDate: string;
  currency: Currency;
  notes?: string;
  terms?: string;
}

export interface CreateInvoiceResponse {
  success: boolean;
  invoiceId: string;
  invoice: Invoice;
}
