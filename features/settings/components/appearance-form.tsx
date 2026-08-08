"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/feedback/toast";
import {
  updateAppearanceAction,
  type SettingsActionState,
} from "@/features/settings/actions";

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
  const { toast } = useToast();
  const [state, formAction] = useActionState(
    updateAppearanceAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast(state.message ?? "Appearance saved", "success");
      router.refresh();
    }
  }, [state.status, state.message, router, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm text-zinc-300">
          Theme
          <Select
            name="theme"
            defaultValue={settings.theme}
            className="mt-1.5"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </Select>
        </label>
        <label className="block text-sm text-zinc-300">
          Accent
          <Select
            name="accentColor"
            defaultValue={settings.accentColor}
            className="mt-1.5"
          >
            <option value="violet">Violet</option>
            <option value="blue">Blue</option>
            <option value="emerald">Emerald</option>
            <option value="rose">Rose</option>
          </Select>
        </label>
        <label className="block text-sm text-zinc-300">
          Density
          <Select
            name="density"
            defaultValue={settings.density}
            className="mt-1.5"
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </Select>
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
        Preferences apply across the app shell immediately after save (theme,
        accent, density, and motion).
      </p>
      {state.status === "error" ? (
        <p className="text-sm text-rose-400" role="alert">
          {state.message}
        </p>
      ) : null}
      <SaveButton />
    </form>
  );
}
