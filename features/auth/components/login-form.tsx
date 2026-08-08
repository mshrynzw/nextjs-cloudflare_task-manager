"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  POST_AUTH_REDIRECT,
  registerWithCredentials,
  signInWithCredentials,
  signInWithGitHub,
  signInWithGoogle,
  type AuthActionState,
} from "@/features/auth/actions";

const initialState: AuthActionState = { status: "idle" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} size="lg">
      {pending ? "Please wait…" : label}
    </Button>
  );
}

interface LoginFormProps {
  emailEnabled: boolean;
  githubEnabled: boolean;
  googleEnabled: boolean;
}

function usePostAuthRedirect(state: AuthActionState): void {
  useEffect(() => {
    if (state.status !== "success") {
      return;
    }
    // Full navigation avoids broken Server Action redirect handling on Workers.
    window.location.assign(state.redirectTo ?? POST_AUTH_REDIRECT);
  }, [state]);
}

export function LoginForm({
  emailEnabled,
  githubEnabled,
  googleEnabled,
}: LoginFormProps) {
  const [signInState, signInAction] = useActionState(
    signInWithCredentials,
    initialState,
  );
  const [registerState, registerAction] = useActionState(
    registerWithCredentials,
    initialState,
  );

  usePostAuthRedirect(signInState);
  usePostAuthRedirect(registerState);

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      {emailEnabled ? (
        <>
          <form action={signInAction} className="flex flex-col gap-4">
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
                className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-50 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500/40"
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
                className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-50 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500/40"
              />
            </div>
            {signInState.status === "error" ? (
              <p className="text-sm text-red-400" role="alert">
                {signInState.message}
              </p>
            ) : null}
            <SubmitButton label="Sign In" />
          </form>

          <details className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
            <summary className="cursor-pointer text-sm text-zinc-400">
              Create an account
            </summary>
            <form action={registerAction} className="mt-4 flex flex-col gap-4">
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
                  className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-50 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500/40"
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
                  className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-50 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500/40"
                />
              </div>
              {registerState.status === "error" ? (
                <p className="text-sm text-red-400" role="alert">
                  {registerState.message}
                </p>
              ) : null}
              <SubmitButton label="Create account" />
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
            <form action={signInWithGitHub}>
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                size="lg"
              >
                Continue with GitHub
              </Button>
            </form>
          ) : null}
          {googleEnabled ? (
            <form action={signInWithGoogle}>
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                size="lg"
              >
                Continue with Google
              </Button>
            </form>
          ) : null}
        </div>
      )}
    </div>
  );
}
