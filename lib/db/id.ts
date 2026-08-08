/**
 * Prefixed ID generators for database entities.
 * Uses crypto.randomUUID() for uniqueness (ULID may be adopted later).
 */
export type EntityPrefix =
  | "user"
  | "workspace"
  | "wsmem"
  | "project"
  | "prjmem"
  | "task"
  | "checklist"
  | "tag"
  | "comment"
  | "activity"
  | "notification";

export function createId(prefix: EntityPrefix): string {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

export function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}
