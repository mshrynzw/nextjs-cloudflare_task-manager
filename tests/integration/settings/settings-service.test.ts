import { describe, expect, it } from "vitest";
import { hash } from "bcryptjs";
import { createId, nowUnix } from "@/lib/db/id";
import { userSettings, users } from "@/lib/db/schema";
import {
  changeUserPassword,
  getSettings,
  getUserPublicProfile,
  patchSettings,
  updateCurrentUserProfile,
} from "@/lib/services/user-service";
import { createTestDatabase } from "../../helpers/db";

async function seedUser() {
  const db = createTestDatabase();
  const timestamp = nowUnix();
  const userId = createId("user");
  const passwordHash = await hash("DemoPass123!", 4);

  await db.insert(users).values({
    id: userId,
    email: "settings@example.com",
    name: "Settings User",
    passwordHash,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  await db.insert(userSettings).values({
    userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return { db, userId };
}

describe("settings and profile services", () => {
  it("updates profile fields for the owner", async () => {
    const { db, userId } = await seedUser();
    const updated = await updateCurrentUserProfile(db, userId, userId, {
      name: "Updated Name",
      jobTitle: "Engineer",
      website: "https://example.com",
    });

    expect(updated.name).toBe("Updated Name");
    expect(updated.jobTitle).toBe("Engineer");

    const profile = await getUserPublicProfile(db, userId, userId);
    expect(profile.hasPassword).toBe(true);
    expect(profile.email).toBe("settings@example.com");
  });

  it("patches appearance and notification settings as booleans", async () => {
    const { db, userId } = await seedUser();
    const settings = await patchSettings(db, userId, {
      theme: "light",
      animations: false,
      emailNotifications: false,
    });

    expect(settings.theme).toBe("light");
    expect(settings.animations).toBe(false);
    expect(settings.emailNotifications).toBe(false);

    const loaded = await getSettings(db, userId);
    expect(loaded.theme).toBe("light");
  });

  it("changes password when the current password is valid", async () => {
    const { db, userId } = await seedUser();
    await changeUserPassword(db, userId, {
      currentPassword: "DemoPass123!",
      newPassword: "NewPass123!",
    });

    await expect(
      changeUserPassword(db, userId, {
        currentPassword: "DemoPass123!",
        newPassword: "AnotherPass1!",
      }),
    ).rejects.toThrow(/incorrect/i);
  });

  it("hides auth-sensitive fields from other viewers", async () => {
    const { db, userId } = await seedUser();
    const otherId = createId("user");
    const timestamp = nowUnix();
    await db.insert(users).values({
      id: otherId,
      email: "other@example.com",
      name: "Other",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const profile = await getUserPublicProfile(db, otherId, userId);
    expect(profile.hasPassword).toBeUndefined();
    expect(profile.email).toBeUndefined();
    expect(profile.role).toBeUndefined();
    expect(profile.name).toBe("Settings User");
  });
});
