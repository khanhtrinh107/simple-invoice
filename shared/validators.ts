import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be at most 128 characters"),
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;
export type LoginSchemaOutput = z.infer<typeof loginSchema>;

const customerAddressSchema = z.object({
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

const customerContactSchema = z.object({
  email: z.string().email("Customer email must be a valid email address"),
  phone: z.string().optional(),
  name: z.string().optional(),
});

const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Customer name is required"),
  contact: customerContactSchema,
  address: customerAddressSchema.optional(),
});

const bankAccountSchema = z.object({
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingCode: z.string().optional(),
  accountHolderName: z.string().optional(),
  swiftCode: z.string().optional(),
  iban: z.string().optional(),
});

const invoiceItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative")
    .default(1),
  rate: z
    .number()
    .min(0, "Rate cannot be negative")
    .default(0),
  amount: z.number().min(0).optional(),
  itemOrder: z.number().int().optional(),
});

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  customer: customerSchema,
  bankAccount: bankAccountSchema.optional(),
  items: z.array(invoiceItemSchema).optional(),
  invoiceDate: z
    .string()
    .regex(dateRegex, "Invoice date must be in YYYY-MM-DD format"),
  dueDate: z
    .string()
    .regex(dateRegex, "Due date must be in YYYY-MM-DD format"),
  currency: z.enum(
    [
      "USD",
      "EUR",
      "GBP",
      "JPY",
      "CNY",
      "AUD",
      "CAD",
      "CHF",
      "HKD",
      "SGD",
      "INR",
      "IDR",
      "MYR",
      "THB",
      "PHP",
      "VND",
    ] as const,
    { message: "Please select a valid currency" }
  ),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export type CreateInvoiceSchemaInput = z.input<typeof createInvoiceSchema>;
export type CreateInvoiceSchemaOutput = z.output<typeof createInvoiceSchema>;
