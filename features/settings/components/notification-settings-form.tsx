"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  updateNotificationSettingsAction,
  type SettingsActionState,
} from "@/features/settings/actions";

const initialState: SettingsActionState = { status: "idle" };

const TOGGLES = [
  { name: "emailNotifications", label: "Email notifications" },
  { name: "inAppNotifications", label: "In-app notifications" },
  { name: "taskNotifications", label: "Task notifications" },
  { name: "mentionNotifications", label: "Mention notifications" },
  { name: "dueSoonNotifications", label: "Due soon notifications" },
] as const;

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save preferences"}
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
      {TOGGLES.map((toggle) => (
        <label
          key={toggle.name}
          className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-200"
        >
          {toggle.label}
          <input
            type="checkbox"
            name={toggle.name}
            defaultChecked={settings[toggle.name]}
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
