"use client";

import Header from "../components/Header";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Support Center
          </h1>

          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            We&apos;re working hard to bring you a full-featured support portal.
            New features will be rolling out soon! Thank you.
          </p>

          <div className="mt-8 grid gap-4 max-w-md mx-auto">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                📞 Customer Hotline
              </h3>
              <p className="text-gray-700 mt-1">
                Call us at: <b>0928 735 9757 / 0917 869 4611</b>
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                ✉️ Email Support
              </h3>
              <p className="text-gray-700 mt-1">
                Send us an email at: <b>support@cmdcable.com</b>
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                🕒 Operating Hours
              </h3>
              <p className="text-gray-700 mt-1">
                Monday – Saturday: <b>8:00 AM – 5:00 PM</b>
              </p>
            </div>
          </div>

          <p className="mt-10 text-sm text-gray-500">
            More support features coming soon!
          </p>
        </div>
      </main>
    </div>
  );
}
