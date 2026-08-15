"use client";

import { useI18n } from "@/components/providers/locale-provider";
import { getInitials } from "@/features/project/utils/labels";

export interface WorkspaceMemberOption {
  id: string;
  name: string | null;
  image: string | null;
}

interface WorkspaceMemberPickerProps {
  members: WorkspaceMemberOption[];
  excludeIds?: string[];
}

export function WorkspaceMemberPicker({
  members,
  excludeIds = [],
}: WorkspaceMemberPickerProps) {
  const { t } = useI18n();
  const excluded = new Set(excludeIds);
  const candidates = members.filter((member) => !excluded.has(member.id));

  if (candidates.length === 0) {
    return (
      <p className="text-xs text-zinc-500">{t.projects.noWorkspaceMembers}</p>
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm text-zinc-300">
        {t.projects.membersLabel}
      </legend>
      <p className="text-xs text-zinc-500">{t.projects.membersHelp}</p>
      <ul className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/40 p-2">
        {candidates.map((member) => (
          <li key={member.id}>
            <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm text-zinc-200 hover:bg-zinc-800/80">
              <input
                type="checkbox"
                name="memberIds"
                value={member.id}
                className="size-4 rounded border-zinc-700"
              />
              <span className="flex size-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold">
                {getInitials(member.name)}
              </span>
              <span className="min-w-0 truncate">
                {member.name ?? t.common.unnamed}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
