"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import FieldRow from "../components/ui/FieldRow";
import ActionCard from "../components/ui/ActionCard";
import { IconReceipt, IconHistory, IconSupport } from "../components/ui/Icons";
import { getToken, clearToken } from "@/lib/auth";
import { fetchCurrentUser } from "@/lib/api";

type Me = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  plan: string;
  brate: number;
  package_speed: number;
  serial_number: string;
  amount_due: number;
  due_on: string; // ISO date
};

function DashboardInner() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? getToken() : null;

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        const data = await fetchCurrentUser(token);
        setMe(data);
      } catch {
        clearToken();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, router]);

  if (!token) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="card p-6">Loading your dashboard…</div>
        </main>
      </div>
    );
  }
  if (!me) return null;

  const amountDue = (me.amount_due ?? 0).toFixed(2);
  const dueDate = (() => {
    if (!me.due_on) return "";
    const base = new Date(me.due_on);
    const fourteenth = new Date(base.getFullYear(), base.getMonth(), 14);
    return fourteenth.toLocaleDateString("en-PH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  })();

  // 👇 define a handler for payment redirection
  const handleMakePayment = () => {
    router.push(`/payment?subscriber=${me.id}`);
    // or use me.id if your backend uses numeric IDs instead
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-6">
          <section className="space-y-6 lg:col-span-8">
            <div className="card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">Amount Due</p>
                <p className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                  ₱{amountDue}
                </p>
                {dueDate && (
                  <p className="text-sm text-orange-600 mt-3">
                    Due by {dueDate}
                  </p>
                )}
              </div>

              {/* 👇 updated button */}
              <button
                onClick={handleMakePayment}
                className="mt-5 sm:mt-0 h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              >
                Make a Payment
              </button>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
                <ActionCard
                  title="View Bill Details"
                  subtitle="See a full breakdown"
                  icon={<IconReceipt />}
                />
                <ActionCard
                  title="Payment History"
                  subtitle="Review past payments"
                  icon={<IconHistory />}
                />
                <ActionCard
                  title="Get Support"
                  subtitle="Contact our team"
                  icon={<IconSupport />}
                />
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="grid gap-6">
              <div className="card p-6">
                <h3 className="text-xl font-semibold mb-2">Current Plan</h3>
                <hr />
                <FieldRow label="Plan Name" value={me.plan} />
                <FieldRow
                  label="Speed"
                  value={`Up to ${me.package_speed} Mbps`}
                />
                <FieldRow
                  label="Monthly Rate"
                  value={`₱${(me.brate ?? 0).toFixed(2)}`}
                />
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold mb-2">Account Details</h3>
                <hr />
                <FieldRow label="Customer" value={me.full_name} />
                <FieldRow
                  label="Account Number"
                  value={me.serial_number}
                  copyable
                />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(DashboardInner), { ssr: false });
