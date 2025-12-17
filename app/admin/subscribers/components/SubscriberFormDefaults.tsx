import type { CreateSubscriberForm } from "@/lib/types";

export const NEW_SUBSCRIBER_INITIAL: CreateSubscriberForm = {
  last_name: "",
  first_name: "",
  phone_number: "",
  alternative_phone: "",
  zone: "",

  collector: "",
  date_installed: "",
  serial_number: "",
  tvconnect: false,

  package: "",
  plan: "",
  brate: "",
  package_speed: "",

  mc_address: "",
  stb: "",
  cas: "",

  requires_password_change: true,
};
