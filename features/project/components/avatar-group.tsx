import { cn } from "@/lib/utils";
import { getInitials } from "@/features/project/utils/labels";

export interface AvatarMember {
  id: string;
  name: string | null;
  image?: string | null;
}

interface AvatarGroupProps {
  members: AvatarMember[];
  max?: number;
  className?: string;
}

export function AvatarGroup({
  members,
  max = 4,
  className,
}: AvatarGroupProps) {
  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;

  if (members.length === 0) {
    return <span className="text-xs text-zinc-600">No members</span>;
  }

  return (
    <ul className={cn("flex items-center -space-x-2", className)}>
      {visible.map((member) => (
        <li
          key={member.id}
          aria-label={member.name ?? "Member"}
          title={member.name ?? "Member"}
          className="flex size-7 items-center justify-center rounded-full border-2 border-zinc-950 bg-zinc-700 text-[10px] font-semibold text-zinc-100"
        >
          {member.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.image}
              alt=""
              className="size-full rounded-full object-cover"
            />
          ) : (
            <span aria-hidden>{getInitials(member.name)}</span>
          )}
        </li>
      ))}
      {overflow > 0 ? (
        <li
          aria-label={`${overflow} more members`}
          className="flex size-7 items-center justify-center rounded-full border-2 border-zinc-950 bg-zinc-800 text-[10px] font-medium text-zinc-300"
        >
          +{overflow}
        </li>
      ) : null}
    </ul>
  );
}
