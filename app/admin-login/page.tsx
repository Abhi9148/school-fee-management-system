import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  async function login(formData: FormData) {
    "use server";
    const password = formData.get("password");
    if (password === process.env.ADMIN_PASSWORD) {
      const store = await cookies();
      store.set("admin_auth", "true", { httpOnly: true, path: "/" });
      redirect("/admin");
    }
    redirect("/admin-login?error=1");
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center">
      <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
      <form action={login} className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Password</span>
          <input name="password" type="password" required className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <button type="submit" className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Login
        </button>
      </form>
    </div>
  );
}