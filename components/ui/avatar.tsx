import { cn } from "@/lib/utils";
import { getInitials } from "@/features/project/utils/labels";

interface AvatarProps {
  name?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-16 text-lg",
} as const;

export function Avatar({ name, image, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 font-semibold text-zinc-100",
        SIZE_CLASS[size],
        className,
      )}
      title={name ?? undefined}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="size-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
