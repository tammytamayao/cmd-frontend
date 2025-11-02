"use client";

export default function ActionCard({
  title,
  subtitle,
  icon,
  className = "",
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card p-5 hover:shadow-md transition ${className}`}>
      <div className="w-12 h-12 rounded-2xl grid place-items-center icon-chip">
        {icon}
      </div>
      <div className="mt-4">
        <div className="font-semibold text-[var(--color-cmd-blue)]">
          {title}
        </div>
        <div className="text-sm text-gray-500">{subtitle}</div>
      </div>
    </div>
  );
}
