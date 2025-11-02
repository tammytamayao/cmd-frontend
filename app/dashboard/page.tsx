"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import FieldRow from "../components/ui/FieldRow";
import ActionCard from "../components/ui/ActionCard";
import { IconReceipt, IconHistory, IconSupport } from "../components/ui/Icons";
import { getToken } from "@/lib/auth";

function DashboardInner() {
  const router = useRouter();

  const token = typeof window !== "undefined" ? getToken() : null;
  if (!token) {
    router.replace("/login");
    return null;
  }

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
                  ₱2299.00
                </p>
                <p className="text-sm text-orange-600 mt-3">
                  Due by 30 Nov 2025
                </p>
              </div>
              <button className="mt-5 sm:mt-0 h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                Make a Payment
              </button>
            </div>

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

          <aside className="lg:col-span-4">
            <div className="grid gap-6">
              <div className="card p-6">
                <h3 className="text-xl font-semibold mb-2">Current Plan</h3>
                <hr />
                <FieldRow label="Plan Name" value="H" />
                <FieldRow label="Speed" value="Up to 320 Mbps" />
                <FieldRow label="Monthly Rate" value="₱2299.00" />
                {/* <button className="w-full mt-4 h-10 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium">
                  {" "}
                  View Plan Details{" "}
                </button> */}
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold mb-2">Account Details</h3>
                <hr />
                <FieldRow label="Customer" value="Princess Connie Tamayao" />
                <FieldRow label="Account Number" value="105959-210" copyable />
                {/* <button className="w-full mt-4 h-10 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium">
                  {" "}
                  View Plan Details{" "}
                </button> */}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(DashboardInner), { ssr: false });
