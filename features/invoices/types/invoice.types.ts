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
  name: string;
  contact: CustomerContact;
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
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
  itemOrder?: number;
}

export type InvoiceStatus =
  | "DRAFT"
  | "PENDING"
  | "SENT"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED"
  | "VOID";

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
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: Currency;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  invoiceDate: string;
  dueDate: string;
  customer: Customer;
  bankAccount?: BankAccount;
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  documents?: Document[];
  customFields?: CustomField[];
  extensions?: Extension[];
  createdAt: string;
  updatedAt: string;
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
