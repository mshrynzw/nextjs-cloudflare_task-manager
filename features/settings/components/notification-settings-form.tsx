"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/locale-provider";
import {
  updateNotificationSettingsAction,
  type SettingsActionState,
} from "@/features/settings/actions";

const initialState: SettingsActionState = { status: "idle" };

const TOGGLE_KEYS = [
  "emailNotifications",
  "inAppNotifications",
  "taskNotifications",
  "mentionNotifications",
  "dueSoonNotifications",
] as const;

function SaveButton() {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t.common.saving : t.settings.savePreferences}
    </Button>
  );
}

interface NotificationSettingsFormProps {
  settings: {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    taskNotifications: boolean;
    mentionNotifications: boolean;
    dueSoonNotifications: boolean;
  };
}

export function NotificationSettingsForm({
  settings,
}: NotificationSettingsFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [state, formAction] = useActionState(
    updateNotificationSettingsAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <form action={formAction} className="space-y-3">
      {TOGGLE_KEYS.map((name) => (
        <label
          key={name}
          className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-200"
        >
          {t.settings[name]}
          <input
            type="checkbox"
            name={name}
            defaultChecked={settings[name]}
            className="size-4 rounded border-zinc-700"
          />
        </label>
      ))}
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
