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
  plan: string;
  brate: number;
  serial_number: string;
};
