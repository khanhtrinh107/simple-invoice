import { describe, it, expect } from "vitest";
import { normalizeInvoiceListResponse, to101DigitalInvoicePayload } from "../../features/invoices/api/invoice-api";

describe("normalizeInvoiceListResponse", () => {
  it("maps the upstream paging envelope to flat pagination fields", () => {
    const invoices = [
      { id: "a", invoiceNumber: "INV-1", customer: { name: "Acme" } },
      { id: "b", invoiceNumber: "INV-2", customer: { name: "Beta" } },
      { id: "c", invoiceNumber: "INV-3", customer: { name: "Gamma" } },
    ];

    const result = normalizeInvoiceListResponse({
      data: invoices,
      paging: { pageNumber: 2, pageSize: 3, totalRecords: 7 },
    });

    expect(result.total).toBe(7);
    expect(result.pageNum).toBe(2);
    expect(result.pageSize).toBe(3);
    expect(result.totalPages).toBe(3); // ceil(7 / 3) = 3
  });

  it("returns a single page when totalRecords equals pageSize", () => {
    const result = normalizeInvoiceListResponse({
      data: [{ id: "a", customer: { name: "Acme" } }],
      paging: { pageNumber: 1, pageSize: 10, totalRecords: 10 },
    });

    expect(result.total).toBe(10);
    expect(result.pageSize).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it("clamps totalPages to at least 1 even when results are empty", () => {
    const result = normalizeInvoiceListResponse({
      data: [],
      paging: { pageNumber: 1, pageSize: 10, totalRecords: 0 },
    });

    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
  });

  it("falls back gracefully when paging is missing", () => {
    const invoices = [
      { id: "a", invoiceNumber: "INV-1", customer: { name: "Acme" } },
      { id: "b", invoiceNumber: "INV-2", customer: { name: "Beta" } },
    ];

    const result = normalizeInvoiceListResponse({
      data: invoices,
    });

    expect(result.total).toBe(2);
    expect(result.pageNum).toBe(1);
    expect(result.pageSize).toBe(2);
    expect(result.totalPages).toBe(1);
  });

  it("handles a null/undefined payload without throwing", () => {
    const result = normalizeInvoiceListResponse(null);

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.pageNum).toBe(1);
    expect(result.pageSize).toBe(0);
    expect(result.totalPages).toBe(1);
  });

  it("maps the upstream `invoiceId` field onto the internal `id`", () => {
    const result = normalizeInvoiceListResponse({
      data: [
        {
          invoiceId: "abc-123",
          invoiceNumber: "INV-001",
          invoiceDate: "2026-06-01",
          dueDate: "2026-07-01",
          totalAmount: 100,
          currency: "USD",
          status: [{ key: "Paid", value: true }],
          customer: { name: "Acme" },
        },
      ],
      paging: { pageNumber: 1, pageSize: 10, totalRecords: 1 },
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("abc-123");
    expect(result.data[0].invoiceNumber).toBe("INV-001");
  });

  it("preserves a non-empty `id` if the upstream record already has one", () => {
    const result = normalizeInvoiceListResponse({
      data: [{ id: "already-an-id", invoiceId: "ignored-because-id-set" }],
      paging: { pageNumber: 1, pageSize: 10, totalRecords: 1 },
    });

    expect(result.data[0].id).toBe("already-an-id");
  });

  it("normalizes customer.firstName + lastName into customer.name", () => {
    const result = normalizeInvoiceListResponse({
      data: [
        {
          invoiceId: "x",
          customer: { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" },
        },
      ],
    });

    expect(result.data[0].customer.name).toBe("Ada Lovelace");
    expect(result.data[0].customer.contact?.email).toBe("ada@example.com");
  });

  it("prefers existing customer.name over firstName/lastName when both exist", () => {
    const result = normalizeInvoiceListResponse({
      data: [
        {
          invoiceId: "x",
          customer: { name: "Acme Corp", firstName: "John", lastName: "Doe" },
        },
      ],
    });

    expect(result.data[0].customer.name).toBe("Acme Corp");
  });

  it("falls back to '—' when customer has no name fields", () => {
    const result = normalizeInvoiceListResponse({
      data: [{ invoiceId: "x", customer: {} }],
    });

    expect(result.data[0].customer.name).toBe("—");
  });

  it("drops customer.id from upstream to avoid rendering a raw UUID in the UI", () => {
    const result = normalizeInvoiceListResponse({
      data: [
        {
          invoiceId: "x",
          customer: {
            name: "Acme",
            id: "25ba0000-0000-0000-0000-000000000000",
          },
        },
      ],
    });

    expect(result.data[0].customer.name).toBe("Acme");
    expect(result.data[0].customer.id).toBeUndefined();
  });
});

describe("to101DigitalInvoicePayload", () => {
  it("wraps the result in an invoices array", () => {
    const payload = to101DigitalInvoicePayload({
      invoiceNumber: "INV-001",
      customer: { name: "Test", contact: { email: "test@test.com" } },
      items: [{ name: "Widget", quantity: 1, rate: 10 }],
      invoiceDate: "2026-06-27",
      dueDate: "2026-07-27",
      currency: "USD",
    });

    expect(payload.invoiceNumber).toBe("INV-001");
    expect(payload.items?.[0].itemName).toBe("Widget");
  });

  it("splits customer.name into firstName and lastName", () => {
    const payload = to101DigitalInvoicePayload({
      invoiceNumber: "INV-001",
      customer: { name: "Khanh Tuan Trinh", contact: { email: "test@test.com" } },
      items: [{ name: "Item", quantity: 1, rate: 0 }],
      invoiceDate: "2026-06-27",
      dueDate: "2026-07-27",
      currency: "USD",
    });

    expect(payload.customer?.firstName).toBe("Khanh");
    expect(payload.customer?.lastName).toBe("Tuan Trinh");
  });

  it("maps phone to mobileNumber", () => {
    const payload = to101DigitalInvoicePayload({
      invoiceNumber: "INV-001",
      customer: { name: "Test", contact: { email: "test@test.com", phone: "+84941578262" } },
      items: [{ name: "Item", quantity: 1, rate: 0 }],
      invoiceDate: "2026-06-27",
      dueDate: "2026-07-27",
      currency: "USD",
    });

    expect(payload.customer?.contact?.mobileNumber).toBe("+84941578262");
  });

  it("wraps address into addresses array with type BILLING", () => {
    const payload = to101DigitalInvoicePayload({
      invoiceNumber: "INV-001",
      customer: {
        name: "Test",
        contact: { email: "test@test.com" },
        address: {
          addressLine1: "Ha Noi",
          city: "Ha Noi",
          state: "State",
          postalCode: "10300",
          country: "Vietnam",
        },
      },
      items: [{ name: "Item", quantity: 1, rate: 0 }],
      invoiceDate: "2026-06-27",
      dueDate: "2026-07-27",
      currency: "USD",
    });

    expect(payload.customer?.addresses).toHaveLength(1);
    expect(payload.customer?.addresses?.[0].premise).toBe("Ha Noi");
    expect(payload.customer?.addresses?.[0].city).toBe("Ha Noi");
    expect(payload.customer?.addresses?.[0].county).toBe("State");
    expect(payload.customer?.addresses?.[0].postcode).toBe("10300");
    expect(payload.customer?.addresses?.[0].countryCode).toBe("VI");
    expect(payload.customer?.addresses?.[0].addressType).toBe("BILLING");
  });

  it("derives countryCode from first two letters of country name", () => {
    const payload = (country: string) =>
      to101DigitalInvoicePayload({
        invoiceNumber: "INV-001",
        customer: {
          name: "Test",
          contact: { email: "test@test.com" },
          address: { country },
        },
        items: [{ name: "Item", quantity: 1, rate: 0 }],
        invoiceDate: "2026-06-27",
        dueDate: "2026-07-27",
        currency: "USD",
      });

    expect(payload("Vietnam").customer?.addresses?.[0].countryCode).toBe("VI");
    expect(payload("UNITED STATES").customer?.addresses?.[0].countryCode).toBe("UN");
    expect(payload("").customer?.addresses?.[0].countryCode).toBe("");
    expect(payload(undefined as unknown as string).customer?.addresses?.[0].countryCode).toBe("");
  });

  it("maps bankAccount fields to upstream names", () => {
    const payload = to101DigitalInvoicePayload({
      invoiceNumber: "INV-001",
      customer: { name: "Test", contact: { email: "test@test.com" } },
      bankAccount: {
        bankName: "BNK",
        accountNumber: "12345678",
        routingCode: "09-01-01",
        accountHolderName: "John Doe",
        swiftCode: "SWIFT",
        iban: "GB82WEST",
      },
      items: [{ name: "Item", quantity: 1, rate: 0 }],
      invoiceDate: "2026-06-27",
      dueDate: "2026-07-27",
      currency: "USD",
    });

    expect(payload.bankAccount?.sortCode).toBe("09-01-01");
    expect(payload.bankAccount?.accountNumber).toBe("12345678");
    expect(payload.bankAccount?.accountName).toBe("John Doe");
    expect(payload.bankAccount?.bankId).toBe("");
  });

  it("maps notes and terms into description", () => {
    const payload = to101DigitalInvoicePayload({
      invoiceNumber: "INV-001",
      customer: { name: "Test", contact: { email: "test@test.com" } },
      items: [{ name: "Item", quantity: 1, rate: 0 }],
      invoiceDate: "2026-06-27",
      dueDate: "2026-07-27",
      currency: "USD",
      notes: "Please pay within 30 days.",
      terms: "Late fees apply after 30 days.",
    });

    expect(payload.description).toBe("Please pay within 30 days.\nLate fees apply after 30 days.");
  });

  it("uses notes alone when terms is absent", () => {
    const payload = to101DigitalInvoicePayload({
      invoiceNumber: "INV-001",
      customer: { name: "Test", contact: { email: "test@test.com" } },
      items: [{ name: "Item", quantity: 1, rate: 0 }],
      invoiceDate: "2026-06-27",
      dueDate: "2026-07-27",
      currency: "USD",
      notes: "Thank you for your business.",
    });

    expect(payload.description).toBe("Thank you for your business.");
  });

  it("omits description when both notes and terms are empty", () => {
    const payload = to101DigitalInvoicePayload({
      invoiceNumber: "INV-001",
      customer: { name: "Test", contact: { email: "test@test.com" } },
      items: [{ name: "Item", quantity: 1, rate: 0 }],
      invoiceDate: "2026-06-27",
      dueDate: "2026-07-27",
      currency: "USD",
    });

    expect(payload.description).toBeUndefined();
  });

  it("maps item.name to itemName", () => {
    const payload = to101DigitalInvoicePayload({
      invoiceNumber: "INV-001",
      customer: { name: "Test", contact: { email: "test@test.com" } },
      items: [
        { name: "khânha", description: "desc", quantity: 1, rate: 11.95 },
      ],
      invoiceDate: "2026-06-27",
      dueDate: "2026-07-27",
      currency: "USD",
    });

    expect(payload.items?.[0].itemName).toBe("khânha");
    expect(payload.items?.[0].description).toBe("desc");
    expect(payload.items?.[0].quantity).toBe(1);
    expect(payload.items?.[0].rate).toBe(11.95);
    expect(payload.items?.[0].itemReference).toBe("item-0");
    expect(payload.items?.[0].itemUOM).toBe("");
  });

  it("derives itemReference from item index for multiple items", () => {
    const payload = to101DigitalInvoicePayload({
      invoiceNumber: "INV-001",
      customer: { name: "Test", contact: { email: "test@test.com" } },
      items: [
        { name: "First", quantity: 1, rate: 10 },
        { name: "Second", quantity: 2, rate: 20 },
        { name: "Third", quantity: 3, rate: 30 },
      ],
      invoiceDate: "2026-06-27",
      dueDate: "2026-07-27",
      currency: "USD",
    });

    expect(payload.items?.[0].itemReference).toBe("item-0");
    expect(payload.items?.[1].itemReference).toBe("item-1");
    expect(payload.items?.[2].itemReference).toBe("item-2");
  });

  it("handles empty customer name gracefully", () => {
    const payload = to101DigitalInvoicePayload({
      invoiceNumber: "INV-001",
      customer: { name: "  ", contact: { email: "test@test.com" } },
      items: [{ name: "Item", quantity: 1, rate: 0 }],
      invoiceDate: "2026-06-27",
      dueDate: "2026-07-27",
      currency: "USD",
    });

    expect(payload.customer?.firstName).toBe("");
    expect(payload.customer?.lastName).toBe("");
  });

  it("fills defaults for optional item fields when user leaves them blank", () => {
    const payload = to101DigitalInvoicePayload({
      invoiceNumber: "INV-001",
      customer: { name: "Test", contact: { email: "test@test.com" } },
      items: [{}],
      invoiceDate: "2026-06-27",
      dueDate: "2026-07-27",
      currency: "USD",
    });

    expect(payload.items?.[0].itemReference).toBe("item-0");
    expect(payload.items?.[0].itemName).toBe("");
    expect(payload.items?.[0].quantity).toBe(1);
    expect(payload.items?.[0].rate).toBe(0);
    expect(payload.items?.[0].description).toBe("");
  });

  it("preserves partial values when some item fields are provided", () => {
    const payload = to101DigitalInvoicePayload({
      invoiceNumber: "INV-001",
      customer: { name: "Test", contact: { email: "test@test.com" } },
      items: [{ name: "Consulting" }],
      invoiceDate: "2026-06-27",
      dueDate: "2026-07-27",
      currency: "USD",
    });

    expect(payload.items?.[0].itemName).toBe("Consulting");
    expect(payload.items?.[0].quantity).toBe(1);
    expect(payload.items?.[0].rate).toBe(0);
  });
});