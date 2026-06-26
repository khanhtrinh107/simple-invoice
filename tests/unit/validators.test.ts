import { describe, it, expect } from "vitest";
import {
  loginSchema,
  createInvoiceSchema,
} from "../../shared/validators";

describe("loginSchema", () => {
  it("validates a correct username and password", () => {
    const result = loginSchema.safeParse({
      username: "johndoe",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("fails when username is too short", () => {
    const result = loginSchema.safeParse({
      username: "ab",
      password: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("username");
    }
  });

  it("fails when password is too short", () => {
    const result = loginSchema.safeParse({
      username: "johndoe",
      password: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("password");
    }
  });

  it("fails when username is missing", () => {
    const result = loginSchema.safeParse({
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("fails when password is missing", () => {
    const result = loginSchema.safeParse({
      username: "johndoe",
    });
    expect(result.success).toBe(false);
  });

  it("fails when both fields are empty", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("fails when username exceeds max length", () => {
    const result = loginSchema.safeParse({
      username: "a".repeat(51),
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("createInvoiceSchema", () => {
  const validInvoice = {
    invoiceNumber: "INV-001",
    customer: {
      name: "Acme Corp",
      contact: {
        email: "billing@acme.com",
        phone: "+1234567890",
      },
      address: {
        addressLine1: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "US",
      },
    },
    bankAccount: {
      bankName: "Chase Bank",
      accountNumber: "1234567890",
      routingCode: "021000021",
      accountHolderName: "Acme Corp",
    },
    items: [
      {
        name: "Web Development",
        description: "Frontend development work",
        quantity: 10,
        rate: 150.0,
      },
    ],
    invoiceDate: "2024-01-15",
    dueDate: "2024-02-15",
    currency: "USD" as const,
    notes: "Thank you for your business",
    terms: "Payment due within 30 days",
  };

  it("validates a correct invoice payload", () => {
    const result = createInvoiceSchema.safeParse(validInvoice);
    expect(result.success).toBe(true);
  });

  it("fails when invoiceNumber is missing", () => {
    const { invoiceNumber: _, ...invoice } = validInvoice;
    const result = createInvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(false);
  });

  it("fails when customer email is invalid", () => {
    const invoice = {
      ...validInvoice,
      customer: {
        ...validInvoice.customer,
        contact: { ...validInvoice.customer.contact, email: "not-an-email" },
      },
    };
    const result = createInvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual([
        "customer",
        "contact",
        "email",
      ]);
    }
  });

  it("fails when customer name is missing", () => {
    const invoice = {
      ...validInvoice,
      customer: { ...validInvoice.customer, name: "" },
    };
    const result = createInvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(false);
  });

  it("fails when item quantity is less than 1", () => {
    const invoice = {
      ...validInvoice,
      items: [{ ...validInvoice.items[0], quantity: 0 }],
    };
    const result = createInvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(false);
  });

  it("fails when item rate is negative", () => {
    const invoice = {
      ...validInvoice,
      items: [{ ...validInvoice.items[0], rate: -50 }],
    };
    const result = createInvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(false);
  });

  it("fails when item name is missing", () => {
    const invoice = {
      ...validInvoice,
      items: [{ ...validInvoice.items[0], name: "" }],
    };
    const result = createInvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(false);
  });

  it("fails when invoiceDate is not in YYYY-MM-DD format", () => {
    const invoice = { ...validInvoice, invoiceDate: "01-15-2024" };
    const result = createInvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(false);
  });

  it("fails when dueDate is not in YYYY-MM-DD format", () => {
    const invoice = { ...validInvoice, dueDate: "15/02/2024" };
    const result = createInvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(false);
  });

  it("fails when currency is invalid", () => {
    const invoice = { ...validInvoice, currency: "INVALID" as never };
    const result = createInvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(false);
  });

  it("fails when no items are provided", () => {
    const invoice = { ...validInvoice, items: [] };
    const result = createInvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("At least one item is required");
    }
  });

  it("allows optional fields to be omitted", () => {
    const minimalInvoice = {
      invoiceNumber: "INV-002",
      customer: {
        name: "Small Biz",
        contact: { email: "hello@smallbiz.com" },
      },
      items: [{ name: "Consulting", quantity: 1, rate: 100 }],
      invoiceDate: "2024-03-01",
      dueDate: "2024-03-31",
      currency: "EUR" as const,
    };
    const result = createInvoiceSchema.safeParse(minimalInvoice);
    expect(result.success).toBe(true);
  });

  it("accepts all supported currencies", () => {
    const currencies = [
      "USD", "EUR", "GBP", "JPY", "CNY", "AUD", "CAD",
      "CHF", "HKD", "SGD", "INR", "IDR", "MYR", "THB", "PHP", "VND",
    ];
    for (const currency of currencies) {
      const invoice = { ...validInvoice, currency: currency as never };
      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(true);
    }
  });
});
