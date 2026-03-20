"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="#hero"
              className="flex items-center py-2"
              onClick={() => router.push("/")}
            >
              <Image
                src="/logo.jpg"
                alt="CMD UnliFiberMax"
                width={160}
                height={48}
                className="h-8 w-auto sm:h-9"
                priority
              />
            </Link>

            <Link
              href="/login"
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Login
            </Link>
          </div>
        </div>
      </header>
      <main className="min-h-screen bg-white text-slate-900">
        {/* HERO */}
        <section
          id="hero"
          className="min-h-screen flex items-center relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-blue-50 via-white to-red-50"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-20 md:px-10 lg:flex-row lg:items-center lg:py-28">
            <div className="max-w-3xl flex-1">
              <h1 className="max-w-full text-5xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
                WE BUILD GREAT CONNECTIONS TOGETHER
              </h1>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#about"
                  className="rounded-2xl border border-red-400 bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section
          id="about"
          className="min-h-screen flex items-center mx-auto max-w-7xl px-6 md:px-10"
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                About Us
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Your trusted local partner for internet and entertainment
              </h2>
            </div>

            <div className="space-y-5 text-base leading-8 text-slate-600">
              <p>
                CMD UnliFiberMax is a local telco provider offering fast and
                stable fiber internet connection together with digital cable TV
                services for families and households in the city.
              </p>
              <p>
                We believe every home deserves dependable connectivity for work,
                school, entertainment, and communication — backed by friendly
                service that customers can rely on.
              </p>
            </div>
          </div>
        </section>

        {/* MISSION VISION */}
        <section className="mx-auto max-w-7xl px-6 pb-8 md:px-10">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-blue-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Mission
              </p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">
                What we do
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-600">
                To provide affordable, reliable, and high-speed fiber internet
                connection, bundled with free digital cable TV channels and
                exceptional customer service, helping families stay connected
                for streaming, gaming, learning, and everyday online activities.
              </p>
            </div>

            <div className="rounded-[2rem] border border-red-200 bg-red-600 p-8 text-white shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-100">
                Vision
              </p>
              <h3 className="mt-3 text-2xl font-bold">Where we are going</h3>
              <p className="mt-4 text-base leading-8 text-red-50">
                To become the most trusted local internet and cable service
                provider, empowering communities with fast, stable, and
                accessible digital connectivity.
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="bg-blue-900 py-20 text-white">
          <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">
              Get Connected
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
              Ready to experience better internet?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-blue-100 md:text-lg">
              Contact us today.
            </p>

            <p className="mt-8 text-sm text-blue-200">
              Service available in selected areas. Installation support and
              customer assistance available upon inquiry.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
