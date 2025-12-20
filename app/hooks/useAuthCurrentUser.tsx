"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearToken } from "@/lib/auth";
import { fetchCurrentUser } from "@/lib/api";
import type { CurrentUser } from "@/lib/types";

export function useAuthCurrentUser() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const data = await fetchCurrentUser(token);
        setUser(data);
      } catch {
        clearToken();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return { user, loading };
}
