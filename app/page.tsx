import LoginPage from "./login/page";

export default function Home() {
  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 px-4">
      <main className="min-h-screen grid place-items-center px-4">
        <LoginPage />
      </main>
    </div>
  );
}
