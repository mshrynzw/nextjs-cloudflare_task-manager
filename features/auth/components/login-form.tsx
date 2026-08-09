"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { POST_AUTH_REDIRECT } from "@/features/auth/constants";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
} from "@/lib/db/demo-credentials";

const inputClassName =
  "h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-50 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500/40";

interface LoginFormProps {
  emailEnabled: boolean;
  githubEnabled: boolean;
  googleEnabled: boolean;
}

interface ApiErrorBody {
  error?: {
    message?: string;
  };
}

async function completeCredentialsSignIn(
  email: string,
  password: string,
): Promise<string | undefined> {
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (result?.error) {
    return "Invalid email or password.";
  }

  // Full navigation so the App Router picks up the new session cookie.
  window.location.assign(POST_AUTH_REDIRECT);
  return undefined;
}

async function registerAccount(
  email: string,
  password: string,
): Promise<string | undefined> {
  const response = await fetch("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    return undefined;
  }

  let message = "Unable to create an account.";
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (body.error?.message) {
      message = body.error.message;
    }
  } catch {
    // keep default message
  }
  return message;
}

export function LoginForm({
  emailEnabled,
  githubEnabled,
  googleEnabled,
}: LoginFormProps) {
  const [signInError, setSignInError] = useState<string | undefined>();
  const [registerError, setRegisterError] = useState<string | undefined>();
  const [signInPending, setSignInPending] = useState(false);
  const [registerPending, setRegisterPending] = useState(false);
  const [oauthPending, setOauthPending] = useState<"github" | "google" | null>(
    null,
  );

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignInError(undefined);
    setSignInPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");

    try {
      const errorMessage = await completeCredentialsSignIn(email, password);
      if (errorMessage) {
        setSignInError(errorMessage);
      }
    } catch {
      setSignInError("Unable to sign in. Please try again.");
    } finally {
      setSignInPending(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterError(undefined);
    setRegisterPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");

    try {
      const registerMessage = await registerAccount(email, password);
      if (registerMessage) {
        setRegisterError(registerMessage);
        return;
      }

      const errorMessage = await completeCredentialsSignIn(email, password);
      if (errorMessage) {
        setRegisterError(
          "Account created, but sign-in failed. Try signing in.",
        );
      }
    } catch {
      setRegisterError("Unable to create an account. Please try again.");
    } finally {
      setRegisterPending(false);
    }
  }

  function handleOAuth(provider: "github" | "google") {
    setOauthPending(provider);
    void signIn(provider, { callbackUrl: POST_AUTH_REDIRECT });
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      {emailEnabled ? (
        <>
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm text-zinc-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                className={inputClassName}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm text-zinc-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={128}
                className={inputClassName}
              />
            </div>
            {signInError ? (
              <p className="text-sm text-red-400" role="alert">
                {signInError}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={signInPending}
              size="lg"
            >
              {signInPending ? "Please wait…" : "Sign In"}
            </Button>
          </form>

          <p className="rounded-lg border border-zinc-800/80 bg-zinc-950/30 px-3 py-2 text-xs leading-relaxed text-zinc-500">
            Demo:{" "}
            <span className="select-all font-mono text-zinc-400">
              {DEMO_USER_EMAIL}
            </span>
            {" / "}
            <span className="select-all font-mono text-zinc-400">
              {DEMO_USER_PASSWORD}
            </span>
          </p>

          <details className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
            <summary className="cursor-pointer text-sm text-zinc-400">
              Create an account
            </summary>
            <form onSubmit={handleRegister} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="register-email"
                  className="text-sm text-zinc-300"
                >
                  Email
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={255}
                  className={inputClassName}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="register-password"
                  className="text-sm text-zinc-300"
                >
                  Password
                </label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  className={inputClassName}
                />
              </div>
              {registerError ? (
                <p className="text-sm text-red-400" role="alert">
                  {registerError}
                </p>
              ) : null}
              <Button
                type="submit"
                className="w-full"
                disabled={registerPending}
                size="lg"
              >
                {registerPending ? "Please wait…" : "Create account"}
              </Button>
            </form>
          </details>
        </>
      ) : (
        <p className="text-sm text-zinc-400">
          Email authentication is disabled. Use an OAuth provider below.
        </p>
      )}

      {(githubEnabled || googleEnabled) && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-xs tracking-wide text-zinc-500 uppercase">
            <div className="h-px flex-1 bg-zinc-800" />
            Or continue with
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
          {githubEnabled ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              disabled={oauthPending !== null}
              onClick={() => handleOAuth("github")}
            >
              {oauthPending === "github"
                ? "Please wait…"
                : "Continue with GitHub"}
            </Button>
          ) : null}
          {googleEnabled ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              disabled={oauthPending !== null}
              onClick={() => handleOAuth("google")}
            >
              {oauthPending === "google"
                ? "Please wait…"
                : "Continue with Google"}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
