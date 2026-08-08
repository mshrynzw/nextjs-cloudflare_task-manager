"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  updateProfileAction,
  type SettingsActionState,
} from "@/features/settings/actions";

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/30";

const initialState: SettingsActionState = { status: "idle" };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save profile"}
    </Button>
  );
}

interface ProfileSettingsFormProps {
  profile: {
    name: string | null;
    username: string | null;
    jobTitle: string | null;
    bio: string | null;
    website: string | null;
    image: string | null;
  };
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-zinc-300">
          Display name
          <input
            name="name"
            defaultValue={profile.name ?? ""}
            maxLength={100}
            className={fieldClassName}
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Username
          <input
            name="username"
            defaultValue={profile.username ?? ""}
            maxLength={50}
            className={fieldClassName}
          />
        </label>
      </div>
      <label className="block text-sm text-zinc-300">
        Job title
        <input
          name="jobTitle"
          defaultValue={profile.jobTitle ?? ""}
          maxLength={100}
          className={fieldClassName}
        />
      </label>
      <label className="block text-sm text-zinc-300">
        Bio
        <textarea
          name="bio"
          rows={4}
          maxLength={1000}
          defaultValue={profile.bio ?? ""}
          className={fieldClassName}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-zinc-300">
          Website
          <input
            name="website"
            type="url"
            placeholder="https://"
            defaultValue={profile.website ?? ""}
            className={fieldClassName}
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Avatar URL
          <input
            name="image"
            type="url"
            placeholder="https://"
            defaultValue={profile.image ?? ""}
            className={fieldClassName}
          />
        </label>
      </div>
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
