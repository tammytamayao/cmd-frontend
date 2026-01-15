import { ReactNode } from "react";

export type AdminSubscriber = {
  id: number;
  serial_number: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  alternative_phone?: string | null;
  collector?: string | null;
  zone: string | null;
  plan: string | null;
  brate: number | null;
  package: string | null; // <- your DB schema says string
  package_speed: number | null;
  date_installed: string | null;
  tvconnect?: boolean | null;
  mc_address?: string | null;
  stb?: string | null;
  cas?: string | null;
  requires_password_change?: boolean | null;

  // (keep these if you use them elsewhere)
  latest_billing_amount: number | null;
  latest_billing_due_date: string | null;
  latest_billing_status: string | null;
};

export type AdminBillingSubscriber = {
  id: number;
  serial_number: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  package: string | null;
  plan: string | null;
  zone: string | null;
};

export type AdminBilling = {
  id: number;
  start_date: string | null;
  end_date: string | null;
  amount: number;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;

  subscriber_id: number;
  subscriber: AdminBillingSubscriber;
};

export type PaginationMeta = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

// SUBSCRIBER BILLING

export type Payment = {
  id: string | number;
  payment_date: string;
  amount: number;
  payment_method: string;
  status: string;
  attachment?: string | null;
  reference_number?: string | null;
};

export type PaymentDetail = Payment & {
  billing_id?: number | string;
  billing_period_start?: string | null;
  billing_period_end?: string | null;
  billing_status?: string | null;
  receipt?: {
    filename?: string | null;
    size?: number | null;
    mime_type?: string | null;
    uploaded_at?: string | null;
  } | null;
  receipt_url?: string | null;
};

export type Billing = {
  id: string | number;
  start_date: string;
  end_date: string;
  due_date: string;
  amount: number;
  status: string;
  payments: Payment[];
};

export type Me = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  plan: string;
  brate: number;
  package: string;
  package_speed: number;
  serial_number: string;
  amount_due: number;
  due_on: string;
  zone: string;
  date_installed: string;
};

export type LoginMode = "subscriber" | "admin";
export type ValidationResult = { ok: true } | { ok: false; message: string };

export type CurrentUser = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  plan: string;
  brate: number;
  package: string;
  package_speed: number;
  serial_number: string;
  amount_due: number;
  due_on: string | null;
  zone: string;
  date_installed: string | null;
  latest_billing?: {
    id: number;
    status: string;
  } | null;
};

export type HistoryTab = "bills" | "payments";

export type PaymentsTabProps = {
  payments: Payment[];
  onViewPayment: (id: string | number) => void;
};

export type BillingsTabProps = {
  bills: Billing[];
};

export type PaymentMethod = "GCASH" | "BANK_TRANSFER" | "CASH";

export type CreatePaymentProps = {
  fullName: string;
  packageName: string;
  planName: string;
  amount: number;

  billings: Billing[];
  billingsLoading: boolean;
  billingId: string | number | null;
  onBillingChange: (id: string | number) => void;

  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
};

export type PaymentConfirmProps = {
  inputId: string;

  receiptRequired: boolean;

  accept: string[];
  file: File | null;
  uploadError: string | null;
  onFiles: (files: FileList | null) => void;
  onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
  onRemove: () => void;

  submitError: string | null;
  submitDisabled: boolean;
  submitting: boolean;
  onSubmit: () => void;
};

// ---------------- Types ----------------

export type AdminPaymentSubscriber = {
  id: number | null;
  serial_number: string | null;
  first_name: string | null;
  last_name: string | null;
};

export type AdminPaymentReceipt = {
  filename: string | null;
  size: number | null;
  mime_type: string | null;
  uploaded_at: string | null;
};

export type AdminPayment = {
  id: number;
  payment_date: string | null;
  amount: number;
  payment_method: string;
  status: string;
  attachment: string | null;
  reference_number: string | null;
  invoice_number?: string | null;
  billing_id: number;
  billing_period_start: string | null;
  billing_period_end: string | null;
  billing_status: string | null;
  subscriber: AdminPaymentSubscriber;
  receipt: AdminPaymentReceipt;
  receipt_url?: string | null;
};

export type Stats = {
  period_start: string;
  period_end: string;
  total_revenue: number;
  total_overdue: number;
  new_subscribers: number;
};

export type BillingDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  billing: AdminBilling | null;
};

export type BillingTableProps = {
  billings: AdminBilling[];
  meta?: PaginationMeta | null;
  onPageChange: (page: number) => void;

  onRowClick: (billing: AdminBilling) => void;
  onEdit: (billing: AdminBilling) => void;
  onDelete: (billing: AdminBilling) => void;
  today?: Date;
};

export type EditBillingModalProps = {
  open: boolean;
  onClose: () => void;
  billing: AdminBilling | null;
  onUpdated: (updated: AdminBilling) => void;
};

export type BillingStatusOption = "unpaid" | "paid";

export type SubscriberOption = {
  id: number;
  label: string;
  serial_number?: string | null;
};

export type BillingOption = {
  id: number;
  label: string;
  amount: number;
};

export type CreatePaymentModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (payment: AdminPayment) => void;
};

export type EditPaymentModalProps = {
  open: boolean;
  onClose: () => void;
  payment: AdminPayment | null;
  onUpdated: (payment: AdminPayment) => void;
};

export type PaymentLike = {
  payment_date: string | null;
  amount: number;
  payment_method: string;
  status: string;
  reference_number?: string | null;
  invoice_number?: string | null;
  billing_period_start?: string | null;
  billing_period_end?: string | null;
  receipt?: {
    filename?: string | null;
    size?: number | null;
    mime_type?: string | null;
    uploaded_at?: string | null;
  } | null;
  receipt_url?: string | null;
};

export type PaymentDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  payment: PaymentLike | null;
  loading: boolean;
  error: string | null;
};

export type PaymentTableProps = {
  payments: AdminPayment[];
  meta?: PaginationMeta | null;
  onPageChange: (page: number) => void;

  onRowClick: (payment: AdminPayment) => void;
  onEdit: (payment: AdminPayment) => void;
  onDelete: (payment: AdminPayment) => void;
};

export type EditSubscriberForm = {
  last_name: string;
  first_name: string;
  phone_number: string;
  alternative_phone: string;
  zone: string;

  collector: string;
  date_installed: string; // YYYY-MM-DD
  serial_number: string;
  tvconnect: boolean;

  package: string;
  plan: string;
  brate: string;
  package_speed: string;

  mc_address: string;
  stb: string;
  cas: string;

  requires_password_change: boolean;
};

export const PACKAGE_PLAN_OPTIONS = [
  "MA",
  "MB",
  "MC",
  "FM",
  "RB",
  "FC",
  "FT",
  "FH",
  "FO",
  "FG",
  "FP",
  "M",
  "R",
] as const;

export type PackagePlanOption = (typeof PACKAGE_PLAN_OPTIONS)[number];

export type SubscriberDetailsModalProps = {
  open: boolean;
  subscriber: AdminSubscriber | null;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
};

export type CreateSubscriberForm = {
  last_name: string;
  first_name: string;
  phone_number: string;
  alternative_phone: string;
  zone: string;

  collector: string;
  date_installed: string;
  serial_number: string;
  tvconnect: boolean;

  package: string;
  plan: string;
  brate: string;
  package_speed: string;

  mc_address: string;
  stb: string;
  cas: string;

  requires_password_change: boolean;
};

export type SubscriberFormBase = {
  last_name: string;
  first_name: string;
  phone_number: string;
  alternative_phone: string;
  zone: string;

  collector: string;
  date_installed: string;
  serial_number: string;
  tvconnect: boolean;

  package: string;
  plan: string;
  brate: string;
  package_speed: string;

  mc_address: string;
  stb: string;
  cas: string;
};

export type BatchSummary = {
  group: string;
  accounts_selected: number;
  base_amount: number;
};

export type FinalizeRunProps = {
  submitting: boolean;
  onCancel: () => void;
};

export type BillingRunSummaryProps = {
  displayAccountsSelected: string;
  baseAmount: number;
  adjustmentsBatchTotal: number;
  totalBillingAmount: number;
  summaryError: string | null;
  formatPeso: (n: number) => string;
};

export type AdjustmentItem = {
  id: number;
  description: string;
  amount: number;
};

export type BillingAdjustmentProps = {
  adjustmentNotes: string;
  onAdjustmentNotesChange: (v: string) => void;
  adjAmount: string;
  onAdjAmountChange: (v: string) => void;
  onAddAdjustment: () => void;
  onRemoveAdjustment: (id: number) => void;
  adjustments: AdjustmentItem[];
  formatPeso: (n: number) => string;
};

export type BillingConfigurationProps = {
  billingStart: string;
  onBillingStartChange: (v: string) => void;
  billingEnd: string;
  onBillingEndChange: (v: string) => void;
  dueDate: string;
  onDueDateChange: (v: string) => void;
};

export type PasswordPromptModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirmed: () => void;
  title?: string;
};

export type AdminConfirmModalProps = {
  open: boolean;
  onClose: () => void;

  title?: ReactNode;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmTone?: "primary" | "danger";
  loading?: boolean;

  onConfirm: () => void;
};
