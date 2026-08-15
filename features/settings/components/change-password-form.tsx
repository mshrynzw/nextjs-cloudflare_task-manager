"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/locale-provider";
import {
  changePasswordAction,
  type SettingsActionState,
} from "@/features/settings/actions";

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/30";

const initialState: SettingsActionState = { status: "idle" };

function SaveButton() {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t.settings.updating : t.settings.updatePassword}
    </Button>
  );
}

interface ChangePasswordFormProps {
  hasPassword: boolean;
}

export function ChangePasswordForm({ hasPassword }: ChangePasswordFormProps) {
  const { t } = useI18n();
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
      <p className="text-sm text-zinc-500">{t.settings.oauthPassword}</p>
    );
  }

  return (
    <form id="change-password-form" action={formAction} className="space-y-4">
      <label className="block text-sm text-zinc-300">
        {t.settings.currentPassword}
        <input
          type="password"
          name="currentPassword"
          required
          minLength={8}
          className={fieldClassName}
        />
      </label>
      <label className="block text-sm text-zinc-300">
        {t.settings.newPassword}
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
