export type AdminSubscriber = {
  id: number;
  serial_number: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  zone: string | null;
  plan: string | null;
  brate: number | null;
  package: number | null;
  package_speed: number | null;
  date_installed: string | null;
  latest_billing_amount: number | null;
  latest_billing_due_date: string | null;
  latest_billing_status: string | null;
};
