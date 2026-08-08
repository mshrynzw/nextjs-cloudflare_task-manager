import { redirect } from "next/navigation";
import { auth, isEmailAuthEnabled } from "@/auth";
import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const githubEnabled = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
  );
  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-16 text-zinc-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,124,255,0.28),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(139,92,246,0.18),_transparent_50%)]"
      />
      <section className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 flex flex-col gap-2 text-center">
          <p className="text-xs tracking-[0.2em] text-sky-400 uppercase">
            Task Manager
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-zinc-400">
            Continue with email or your connected provider.
          </p>
        </div>
        <LoginForm
          emailEnabled={isEmailAuthEnabled()}
          githubEnabled={githubEnabled}
          googleEnabled={googleEnabled}
        />
      </section>
    </main>
  );
}
