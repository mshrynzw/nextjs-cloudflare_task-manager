"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/feedback/toast";
import { useI18n } from "@/components/providers/locale-provider";
import {
  updateAppearanceAction,
  type SettingsActionState,
} from "@/features/settings/actions";
import type { Locale } from "@/lib/i18n/locale";

const initialState: SettingsActionState = { status: "idle" };

function SaveButton() {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t.common.saving : t.settings.saveAppearance}
    </Button>
  );
}

interface AppearanceFormProps {
  settings: {
    theme: string;
    accentColor: string;
    density: string;
    animations: boolean;
    language: Locale;
  };
}

export function AppearanceForm({ settings }: AppearanceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useI18n();
  const [state, formAction] = useActionState(
    updateAppearanceAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast(state.message ?? t.toasts.appearanceSaved, "success");
      router.refresh();
    }
  }, [state.status, state.message, router, toast, t.toasts.appearanceSaved]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm text-zinc-300">
          {t.settings.theme}
          <Select name="theme" defaultValue={settings.theme} className="mt-1.5">
            <option value="dark">{t.settings.themeDark}</option>
            <option value="light">{t.settings.themeLight}</option>
            <option value="system">{t.settings.themeSystem}</option>
          </Select>
        </label>
        <label className="block text-sm text-zinc-300">
          {t.settings.accent}
          <Select
            name="accentColor"
            defaultValue={settings.accentColor}
            className="mt-1.5"
          >
            <option value="violet">{t.settings.accentViolet}</option>
            <option value="blue">{t.settings.accentBlue}</option>
            <option value="emerald">{t.settings.accentEmerald}</option>
            <option value="rose">{t.settings.accentRose}</option>
          </Select>
        </label>
        <label className="block text-sm text-zinc-300">
          {t.settings.density}
          <Select
            name="density"
            defaultValue={settings.density}
            className="mt-1.5"
          >
            <option value="comfortable">{t.settings.densityComfortable}</option>
            <option value="compact">{t.settings.densityCompact}</option>
          </Select>
        </label>
        <label className="block text-sm text-zinc-300">
          {t.settings.language}
          <Select
            name="language"
            defaultValue={settings.language}
            className="mt-1.5"
          >
            <option value="ja">{t.settings.languageJa}</option>
            <option value="en">{t.settings.languageEn}</option>
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
        {t.settings.animations}
      </label>
      <p className="text-xs text-zinc-500">{t.settings.appearanceHint}</p>
      {state.status === "error" ? (
        <p className="text-sm text-rose-400" role="alert">
          {state.message}
        </p>
      ) : null}
      <SaveButton />
    </form>
  );
}
