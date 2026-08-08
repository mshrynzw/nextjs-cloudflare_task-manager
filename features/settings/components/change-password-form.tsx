"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  changePasswordAction,
  type SettingsActionState,
} from "@/features/settings/actions";

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/30";

const initialState: SettingsActionState = { status: "idle" };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Updating…" : "Update password"}
    </Button>
  );
}

interface ChangePasswordFormProps {
  hasPassword: boolean;
}

export function ChangePasswordForm({ hasPassword }: ChangePasswordFormProps) {
  const [state, formAction] = useActionState(changePasswordAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      const form = document.getElementById(
        "change-password-form",
      ) as HTMLFormElement | null;
      form?.reset();
    }
  }, [state.status]);

  if (!hasPassword) {
    return (
      <p className="text-sm text-zinc-500">
        This account uses a social provider. Password change is available for
        email accounts only.
      </p>
    );
  }

  return (
    <form id="change-password-form" action={formAction} className="space-y-4">
      <label className="block text-sm text-zinc-300">
        Current password
        <input
          type="password"
          name="currentPassword"
          required
          minLength={8}
          className={fieldClassName}
        />
      </label>
      <label className="block text-sm text-zinc-300">
        New password
        <input
          type="password"
          name="newPassword"
          required
          minLength={8}
          className={fieldClassName}
        />
      </label>
      {state.status === "error" ? (
        <p className="text-sm text-rose-400" role="alert">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" ? (
        <p className="text-sm text-emerald-400" role="status">
          {state.message}
        </p>
      ) : null}
      <SaveButton />
    </form>
  );
}
