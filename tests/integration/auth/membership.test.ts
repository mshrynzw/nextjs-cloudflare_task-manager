import { describe, expect, it } from "vitest";
import { findWorkspaceMembership } from "@/lib/auth/membership";
import { createId, nowUnix } from "@/lib/db/id";
import { users, workspaceMembers, workspaces } from "@/lib/db/schema";
import { createTestDatabase } from "../../helpers/db";

describe("findWorkspaceMembership", () => {
  it("returns membership for an authorized user", async () => {
    const db = createTestDatabase();
    const timestamp = nowUnix();
    const userId = createId("user");
    const otherUserId = createId("user");
    const workspaceId = createId("workspace");

    await db.insert(users).values([
      {
        id: userId,
        email: "member@example.com",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: otherUserId,
        email: "outsider@example.com",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ]);

    await db.insert(workspaces).values({
      id: workspaceId,
      name: "Team",
      slug: "team",
      createdBy: userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await db.insert(workspaceMembers).values({
      id: createId("wsmem"),
      workspaceId,
      userId,
      role: "member",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const membership = await findWorkspaceMembership(db, userId, workspaceId);
    const outsider = await findWorkspaceMembership(
      db,
      otherUserId,
      workspaceId,
    );

    expect(membership?.role).toBe("member");
    expect(outsider).toBeUndefined();
  });
});
