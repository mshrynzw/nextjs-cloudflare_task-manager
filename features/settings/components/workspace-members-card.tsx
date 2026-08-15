"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/feedback/toast";
import { useI18n } from "@/components/providers/locale-provider";
import { interpolate } from "@/lib/i18n/interpolate";
import { roleLabel } from "@/lib/i18n/labels";
import { getInitials } from "@/features/project/utils/labels";
import {
  addWorkspaceMemberAction,
  removeWorkspaceMemberAction,
  updateWorkspaceMemberRoleAction,
} from "@/features/settings/workspace-actions";
import type { SettingsActionState } from "@/features/settings/actions";

const initialState: SettingsActionState = { status: "idle" };
const ROLES = ["owner", "member", "viewer"] as const;

interface WorkspaceMember {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
}

interface WorkspaceMembersCardProps {
  workspaceId: string;
  currentUserId: string;
  members: WorkspaceMember[];
  canManage: boolean;
}

export function WorkspaceMembersCard({
  workspaceId,
  currentUserId,
  members,
  canManage,
}: WorkspaceMembersCardProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const boundAdd = addWorkspaceMemberAction.bind(null, workspaceId);
  const [state, formAction] = useActionState(boundAdd, initialState);
  const [isPending, startTransition] = useTransition();
  const ownerCount = members.filter((member) => member.role === "owner").length;

  useEffect(() => {
    if (state.status === "success") {
      toast(state.message ?? t.toasts.workspaceMemberAdded, "success");
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.status, state.message, router, toast, t.toasts.workspaceMemberAdded]);

  function onRoleChange(member: WorkspaceMember, role: string) {
    if (role === member.role) {
      return;
    }
    startTransition(async () => {
      const result = await updateWorkspaceMemberRoleAction(
        workspaceId,
        member.id,
        role,
      );
      if (result.status === "error") {
        toast(result.message ?? t.settings.workspaceRoleChangeFailed, "error");
        return;
      }
      toast(result.message ?? t.toasts.workspaceRoleUpdated, "success");
      router.refresh();
    });
  }

  function onRemove(member: WorkspaceMember) {
    const name = member.name ?? t.common.member;
    const confirmed = window.confirm(
      interpolate(t.settings.workspaceRemoveConfirm, { name }),
    );
    if (!confirmed) {
      return;
    }
    startTransition(async () => {
      const result = await removeWorkspaceMemberAction(workspaceId, member.id);
      if (result.status === "error") {
        toast(result.message ?? t.settings.workspaceRemoveFailed, "error");
        return;
      }
      toast(result.message ?? t.toasts.workspaceMemberRemoved, "success");
      router.refresh();
    });
  }

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-zinc-200">
          {t.settings.workspaceMembers}
        </h3>
        <span className="text-xs text-zinc-500">
          {interpolate(t.settings.workspaceMemberCount, {
            count: members.length,
          })}
        </span>
      </div>

      {canManage ? null : (
        <p className="mb-3 text-xs text-zinc-500">
          {t.settings.workspaceOwnerOnly}
        </p>
      )}

      <ul className="space-y-3">
        {members.map((member) => {
          const name = member.name ?? t.common.member;
          const isLastOwner = member.role === "owner" && ownerCount <= 1;
          const canEditMember = canManage && !isLastOwner;
          return (
            <li key={member.id} className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200">
                {getInitials(member.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-zinc-100">
                  {name}
                  {member.id === currentUserId ? (
                    <span className="ml-2 text-xs text-zinc-500">
                      {t.settings.workspaceYou}
                    </span>
                  ) : null}
                </p>
                {canEditMember ? null : (
                  <p className="text-xs text-zinc-500">
                    {roleLabel(t, member.role)}
                    {isLastOwner && canManage
                      ? ` · ${t.settings.workspaceLastOwner}`
                      : null}
                  </p>
                )}
              </div>
              {canEditMember ? (
                <label className="shrink-0">
                  <span className="sr-only">
                    {interpolate(t.settings.workspaceChangeRole, { name })}
                  </span>
                  <Select
                    value={member.role}
                    disabled={isPending}
                    className="h-8 w-28"
                    onChange={(event) =>
                      onRoleChange(member, event.target.value)
                    }
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {roleLabel(t, role)}
                      </option>
                    ))}
                  </Select>
                </label>
              ) : null}
              {canEditMember ? (
                <button
                  type="button"
                  className="shrink-0 text-xs text-zinc-500 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]"
                  disabled={isPending}
                  onClick={() => onRemove(member)}
                  aria-label={interpolate(t.settings.workspaceRemoveMember, {
                    name,
                  })}
                >
                  {t.common.remove}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      {canManage ? (
        <form
          ref={formRef}
          action={formAction}
          className="mt-4 space-y-2 border-t border-zinc-800/80 pt-4"
        >
          <p className="text-xs font-medium text-zinc-400">
            {t.settings.workspaceAddMember}
          </p>
          <p className="text-xs text-zinc-500">{t.settings.workspaceAddHint}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="min-w-0 flex-1">
              <span className="sr-only">{t.settings.workspaceAddEmail}</span>
              <Input
                type="email"
                name="email"
                required
                autoComplete="off"
                placeholder={t.settings.workspaceAddEmailPlaceholder}
                className="h-9"
              />
            </label>
            <label>
              <span className="sr-only">{t.settings.workspaceAddRole}</span>
              <Select name="role" defaultValue="member" className="h-9 sm:w-28">
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(t, role)}
                  </option>
                ))}
              </Select>
            </label>
            <Button type="submit" size="sm" className="sm:self-stretch">
              <Plus data-icon="inline-start" className="size-3.5" />
              {t.settings.workspaceAddSubmit}
            </Button>
          </div>
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
