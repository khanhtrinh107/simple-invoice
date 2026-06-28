"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileTextIcon,
  UserIcon,
  MapPinIcon,
  Building2Icon,
  PackageIcon,
  FileEditIcon,
  PlusIcon,
  XIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import {
  createInvoiceSchema,
  type CreateInvoiceSchemaInput,
  type CreateInvoiceSchemaOutput,
} from "@/shared/validators";
import { ROUTES } from "@/shared/constants";
import { useCreateInvoice } from "@/features/invoices/hooks/use-create-invoice";
import { calculateItemAmount, formatDateISO } from "@/shared/utils";
import type { CreateInvoicePayload } from "@/features/invoices/types/invoice.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "JPY", label: "JPY — Japanese Yen" },
  { value: "CNY", label: "CNY — Chinese Yuan" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
  { value: "CHF", label: "CHF — Swiss Franc" },
  { value: "HKD", label: "HKD — Hong Kong Dollar" },
  { value: "SGD", label: "SGD — Singapore Dollar" },
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "IDR", label: "IDR — Indonesian Rupiah" },
  { value: "MYR", label: "MYR — Malaysian Ringgit" },
  { value: "THB", label: "THB — Thai Baht" },
  { value: "PHP", label: "PHP — Philippine Peso" },
  { value: "VND", label: "VND — Vietnamese Dong" },
];

function getDefaultValues(): CreateInvoiceSchemaInput {
  const today = formatDateISO(new Date());
  const thirtyDaysOut = formatDateISO(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  return {
    invoiceNumber: "",
    invoiceDate: today,
    dueDate: thirtyDaysOut,
    currency: "USD",
    customer: {
      name: "",
      contact: {
        email: "",
        phone: "",
      },
      address: {
        addressLine1: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
    },
    bankAccount: {
      bankName: "",
      accountNumber: "",
      routingCode: "",
      accountHolderName: "",
      swiftCode: "",
      iban: "",
    },
    items: [],
    notes: "",
    terms: "",
  };
}

interface FieldErrorProps {
  message?: string;
}

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-[#EF4444] dark:text-[#FCA5A5]">
      {message}
    </p>
  );
}

interface SectionProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function FormSection({ title, description, icon, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/10">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="font-heading text-sm font-semibold text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function InvoiceForm() {
  const router = useRouter();
  const { create, isLoading, error } = useCreateInvoice();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateInvoiceSchemaInput, unknown, CreateInvoiceSchemaOutput>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Subscribe directly to the specific fields we need. This is the React Hook
  // Form–idiomatic way to derive state from form values without falling into
  // the `watch()` array-returning anti-pattern that breaks useMemo deps.
  const watchedItems = useWatch({ control, name: "items" });
  const watchedCurrency = useWatch({ control, name: "currency" });

  // Stable reference to the current items array — `useWatch` returns a new
  // array on every render even when the underlying values haven't changed,
  // so memoizing it keeps the `totalAmount` useMemo from recomputing
  // unnecessarily.
  const itemsForTotal = React.useMemo(
    () => watchedItems ?? [],
    [watchedItems]
  );

  const totalAmount = React.useMemo(() => {
    if (!itemsForTotal.length) return 0;
    return itemsForTotal.reduce((sum, item) => {
      return sum + calculateItemAmount(item?.quantity ?? 0, item?.rate ?? 0);
    }, 0);
  }, [itemsForTotal]);

  const onSubmit = handleSubmit(async (values: CreateInvoiceSchemaOutput) => {
    try {
      const payload: CreateInvoicePayload = {
        ...values,
        items: (values.items ?? []).map((item) => ({
          ...item,
          amount: calculateItemAmount(item.quantity, item.rate),
        })),
      };
      await create(payload);
      toast.success("Invoice created successfully");
      router.push(ROUTES.INVOICES);
      router.refresh();
    } catch {
      // Error is already set in the hook
    }
  });

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-6"
      aria-label="Create invoice form"
    >
      {error ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* Invoice Information */}
      <FormSection
        title="Invoice Details"
        description="Basic information about this invoice"
        icon={<FileTextIcon className="size-4" />}
      >
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="invoiceNumber">Invoice Number *</Label>
          <Input
            id="invoiceNumber"
            placeholder="e.g. INV-001"
            aria-invalid={!!errors.invoiceNumber}
            aria-describedby={errors.invoiceNumber ? "invoiceNumber-error" : undefined}
            {...register("invoiceNumber")}
          />
          <FieldError message={errors.invoiceNumber?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invoiceDate">Invoice Date *</Label>
          <Input
            id="invoiceDate"
            type="date"
            aria-invalid={!!errors.invoiceDate}
            aria-describedby={errors.invoiceDate ? "invoiceDate-error" : undefined}
            {...register("invoiceDate")}
          />
          <FieldError message={errors.invoiceDate?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="date"
            aria-invalid={!!errors.dueDate}
            aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
            {...register("dueDate")}
          />
          <FieldError message={errors.dueDate?.message} />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="currency">Currency *</Label>
          <Select
            value={watchedCurrency}
            onValueChange={(value) => setValue("currency", value as CreateInvoiceSchemaInput["currency"])}
          >
            <SelectTrigger
              id="currency"
              aria-invalid={!!errors.currency}
              className="w-full"
            >
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.currency?.message} />
        </div>
      </FormSection>

      {/* Customer Information */}
      <FormSection
        title="Customer"
        description="Customer contact details"
        icon={<UserIcon className="size-4" />}
      >
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="customerName">Customer Name *</Label>
          <Input
            id="customerName"
            placeholder="e.g. Acme Corporation"
            aria-invalid={!!errors.customer?.name}
            aria-describedby={errors.customer?.name ? "customerName-error" : undefined}
            {...register("customer.name")}
          />
          <FieldError message={errors.customer?.name?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="customerEmail">Email Address *</Label>
          <Input
            id="customerEmail"
            type="email"
            placeholder="customer@example.com"
            aria-invalid={!!errors.customer?.contact?.email}
            aria-describedby={errors.customer?.contact?.email ? "customerEmail-error" : undefined}
            {...register("customer.contact.email")}
          />
          <FieldError message={errors.customer?.contact?.email?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="customerPhone">Phone Number</Label>
          <Input
            id="customerPhone"
            type="tel"
            placeholder="+1 234 567 8900"
            {...register("customer.contact.phone")}
          />
        </div>
      </FormSection>

      {/* Customer Address */}
      <FormSection
        title="Billing Address"
        description="Customer billing address"
        icon={<MapPinIcon className="size-4" />}
      >
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="addressLine1">Street Address</Label>
          <Input
            id="addressLine1"
            placeholder="123 Main Street, Suite 100"
            {...register("customer.address.addressLine1")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="San Francisco"
            {...register("customer.address.city")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">State / Province</Label>
          <Input
            id="state"
            placeholder="CA"
            {...register("customer.address.state")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="postalCode">Postal / ZIP Code</Label>
          <Input
            id="postalCode"
            placeholder="94102"
            {...register("customer.address.postalCode")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="United States"
            {...register("customer.address.country")}
          />
        </div>
      </FormSection>

      {/* Bank Account */}
      <FormSection
        title="Bank Account"
        description="Optional bank details for payment transfer"
        icon={<Building2Icon className="size-4" />}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bankName">Bank Name</Label>
          <Input
            id="bankName"
            placeholder="First National Bank"
            {...register("bankAccount.bankName")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="accountNumber">Account Number</Label>
          <Input
            id="accountNumber"
            placeholder="1234567890"
            {...register("bankAccount.accountNumber")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="routingCode">Routing / SWIFT Code</Label>
          <Input
            id="routingCode"
            placeholder="ABCDEF123"
            {...register("bankAccount.routingCode")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="accountHolderName">Account Holder Name</Label>
          <Input
            id="accountHolderName"
            placeholder="John Doe"
            {...register("bankAccount.accountHolderName")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="swiftCode">SWIFT Code</Label>
          <Input
            id="swiftCode"
            placeholder="SWIFT123"
            {...register("bankAccount.swiftCode")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="iban">IBAN</Label>
          <Input
            id="iban"
            placeholder="GB82WEST12345698765432"
            {...register("bankAccount.iban")}
          />
        </div>
      </FormSection>

      {/* Line Items */}
      <FormSection
        title="Line Items"
        description="Optional — add items to detail the invoice"
        icon={<PackageIcon className="size-4" />}
      >
        <div className="sm:col-span-2">
          {fields.map((field, index) => {
            return (
              <div
                key={field.id}
                className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4 last:mb-0"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                  <div className="flex flex-col gap-1.5 sm:col-span-5">
                    <Label htmlFor={`item-name-${index}`}>Item Name</Label>
                    <Input
                      id={`item-name-${index}`}
                      placeholder="e.g. Web Development Services"
                      {...register(`items.${index}.name`)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-7">
                    <Label htmlFor={`item-description-${index}`}>Description</Label>
                    <Input
                      id={`item-description-${index}`}
                      placeholder="Optional item description"
                      {...register(`items.${index}.description`)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-3">
                    <Label htmlFor={`item-quantity-${index}`}>Quantity</Label>
                    <Input
                      id={`item-quantity-${index}`}
                      type="number"
                      min="0"
                      step="1"
                      placeholder="1"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-3">
                    <Label htmlFor={`item-rate-${index}`}>Rate</Label>
                    <Input
                      id={`item-rate-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...register(`items.${index}.rate`, { valueAsNumber: true })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-3">
                    <Label>Amount</Label>
                    <div className="flex h-12 items-center rounded-[10px] border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
                      {calculateItemAmount(
                        watchedItems?.[index]?.quantity ?? 0,
                        watchedItems?.[index]?.rate ?? 0
                      ).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-end justify-end sm:col-span-3">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => remove(index)}
                      aria-label="Remove item"
                    >
                      <XIcon />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            variant="default-outline"
            size="sm"
            onClick={() =>
              append({ name: "", description: "", quantity: 1, rate: 0 })
            }
            className="mt-1"
          >
            <PlusIcon />
            Add item
          </Button>
        </div>
      </FormSection>

      {/* Notes & Terms */}
      <FormSection
        title="Notes & Terms"
        description="Optional additional information"
        icon={<FileEditIcon className="size-4" />}
      >
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Payment terms, thank you message, or any special instructions..."
            rows={3}
            {...register("notes")}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="terms">Terms & Conditions</Label>
          <Textarea
            id="terms"
            placeholder="Invoice is due within 30 days. Late payments may incur additional fees..."
            rows={3}
            {...register("terms")}
          />
        </div>
      </FormSection>

      {/* Summary & Actions */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Total Amount ({watchedCurrency ?? "USD"})
            </p>
            <p className="font-heading text-3xl font-bold tracking-tight text-foreground">
              {totalAmount.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="default-outline"
              size="default"
              nativeButton={false}
              render={<Link href={ROUTES.INVOICES} />}
            >
              <ArrowLeftIcon />
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="default"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-white/40 border-r-white"
                  />
                  Creating…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <PlusIcon />
                  Create Invoice
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
