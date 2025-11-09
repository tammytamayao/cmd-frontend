export default function HelloPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Hello from the page! Trial 1</h1>
        <p className="text-gray-600">Timestamp: {new Date().toISOString()}</p>
      </div>
    </div>
  );
}
