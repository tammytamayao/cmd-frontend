export function Badge({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "red" | "gray";
}) {
  const map = {
    green: "bg-green-100 text-green-700 ring-green-200",
    red: "bg-red-100 text-red-700 ring-red-200",
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
  } as const;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${map[tone]}`}
    >
      {children}
    </span>
  );
}
