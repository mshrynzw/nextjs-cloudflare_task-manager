"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  updateAppearanceAction,
  type SettingsActionState,
} from "@/features/settings/actions";

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/30";

const initialState: SettingsActionState = { status: "idle" };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save appearance"}
    </Button>
  );
}

interface AppearanceFormProps {
  settings: {
    theme: string;
    accentColor: string;
    density: string;
    animations: boolean;
  };
}

export function AppearanceForm({ settings }: AppearanceFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    updateAppearanceAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm text-zinc-300">
          Theme
          <select
            name="theme"
            defaultValue={settings.theme}
            className={fieldClassName}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </label>
        <label className="block text-sm text-zinc-300">
          Accent
          <select
            name="accentColor"
            defaultValue={settings.accentColor}
            className={fieldClassName}
          >
            <option value="violet">Violet</option>
            <option value="blue">Blue</option>
            <option value="emerald">Emerald</option>
            <option value="rose">Rose</option>
          </select>
        </label>
        <label className="block text-sm text-zinc-300">
          Density
          <select
            name="density"
            defaultValue={settings.density}
            className={fieldClassName}
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="animations"
          defaultChecked={settings.animations}
          className="size-4 rounded border-zinc-700"
        />
        Enable animations
      </label>
      <p className="text-xs text-zinc-500">
        Preferences are saved to your account. Full visual theming lands in a
        later polish phase.
      </p>
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
