"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { AvatarGroup } from "@/features/project/components/avatar-group";
import { useI18n } from "@/components/providers/locale-provider";
import { interpolate } from "@/lib/i18n/interpolate";
import { roleLabel } from "@/lib/i18n/labels";
import { getInitials } from "@/features/project/utils/labels";
import {
  addProjectMemberAction,
  removeProjectMemberAction,
  type ProjectActionState,
} from "@/features/project/actions";
import type { WorkspaceMemberOption } from "@/features/project/components/workspace-member-picker";

const initialState: ProjectActionState = { status: "idle" };

interface ProjectMember {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
}

interface ProjectMembersCardProps {
  projectId: string;
  members: ProjectMember[];
  workspaceMembers: WorkspaceMemberOption[];
  canManage: boolean;
}

export function ProjectMembersCard({
  projectId,
  members,
  workspaceMembers,
  canManage,
}: ProjectMembersCardProps) {
  const { t } = useI18n();
  const router = useRouter();
  const memberIds = new Set(members.map((member) => member.id));
  const candidates = workspaceMembers.filter(
    (member) => !memberIds.has(member.id),
  );
  const ownerCount = members.filter((member) => member.role === "owner").length;
  const boundAdd = addProjectMemberAction.bind(null, projectId);
  const [state, formAction] = useActionState(boundAdd, initialState);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  function onRemove(member: ProjectMember) {
    const confirmed = window.confirm(
      interpolate(t.project.removeMemberConfirm, {
        name: member.name ?? t.common.member,
      }),
    );
    if (!confirmed) {
      return;
    }
    startTransition(async () => {
      const result = await removeProjectMemberAction(projectId, member.id);
      if (result.status === "error") {
        window.alert(result.message ?? t.project.removeMemberFailed);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200">
          {t.project.members}
        </h3>
        <AvatarGroup members={members} max={5} />
      </div>
      {members.length === 0 ? (
        <p className="text-sm text-zinc-500">{t.project.noMembers}</p>
      ) : (
        <ul className="space-y-3">
          {members.map((member) => {
            const canRemove =
              canManage && !(member.role === "owner" && ownerCount <= 1);
            return (
              <li key={member.id} className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200">
                  {getInitials(member.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-100">
                    {member.name ?? t.common.member}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {roleLabel(t, member.role)}
                  </p>
                </div>
                {canRemove ? (
                  <button
                    type="button"
                    className="text-xs text-zinc-500 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]"
                    disabled={isPending}
                    onClick={() => onRemove(member)}
                    aria-label={interpolate(t.project.removeMember, {
                      name: member.name ?? t.common.member,
                    })}
                  >
                    {t.common.remove}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {canManage ? (
        <form
          action={formAction}
          className="mt-4 space-y-2 border-t border-zinc-800/80 pt-4"
        >
          <p className="text-xs font-medium text-zinc-400">
            {t.project.addMember}
          </p>
          {candidates.length === 0 ? (
            <p className="text-xs text-zinc-500">{t.project.noCandidates}</p>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="min-w-0 flex-1">
                <span className="sr-only">{t.project.addMemberSelect}</span>
                <Select name="userId" required defaultValue="" className="h-9">
                  <option value="" disabled>
                    {t.project.addMemberSelect}
                  </option>
                  {candidates.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name ?? t.common.unnamed}
                    </option>
                  ))}
                </Select>
              </label>
              <label>
                <span className="sr-only">{t.project.addMemberRole}</span>
                <Select
                  name="role"
                  defaultValue="member"
                  className="h-9 sm:w-28"
                >
                  <option value="member">{t.role.member}</option>
                  <option value="viewer">{t.role.viewer}</option>
                </Select>
              </label>
              <Button type="submit" size="sm" className="sm:self-stretch">
                <Plus data-icon="inline-start" className="size-3.5" />
                {t.project.addMemberSubmit}
              </Button>
            </div>
          )}
          {state.status === "error" ? (
            <p className="text-sm text-rose-400" role="alert">
              {state.message}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
