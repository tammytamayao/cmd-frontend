"use client";

export default function LoadingCard({ text = "Loading…" }: { text?: string }) {
  return <div className="card p-6">{text}</div>;
}
