"use client";

import type { ReactNode } from "react";
import { NotificationProvider } from "@/app/notification/NotificationProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}
