import { InvoiceForm } from "@/features/invoices/components/invoice-form";

export default function CreateInvoicePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create Invoice</h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to create a new invoice.
        </p>
      </div>
      <InvoiceForm />
    </div>
  );
}