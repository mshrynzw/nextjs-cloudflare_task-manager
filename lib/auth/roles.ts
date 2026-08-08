export type MembershipRole = "owner" | "member" | "viewer";

const roleRank: Record<MembershipRole, number> = {
  viewer: 1,
  member: 2,
  owner: 3,
};

export function hasMinimumRole(
  role: MembershipRole,
  minimumRole: MembershipRole,
): boolean {
  return roleRank[role] >= roleRank[minimumRole];
}

export function assertMinimumRole(
  role: MembershipRole,
  minimumRole: MembershipRole,
): boolean {
  return hasMinimumRole(role, minimumRole);
}
