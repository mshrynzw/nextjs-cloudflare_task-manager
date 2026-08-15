import { describe, expect, it } from "vitest";
import { canReadProject, canWriteProject } from "@/lib/auth/project-access";

describe("canReadProject", () => {
  it("allows project members even when the project is members-only", () => {
    expect(
      canReadProject({
        visibility: "members",
        isProjectMember: true,
        isWorkspaceMember: true,
      }),
    ).toBe(true);
  });

  it("allows workspace members to read workspace-visible projects", () => {
    expect(
      canReadProject({
        visibility: "workspace",
        isProjectMember: false,
        isWorkspaceMember: true,
      }),
    ).toBe(true);
  });

  it("hides members-only projects from non-members", () => {
    expect(
      canReadProject({
        visibility: "members",
        isProjectMember: false,
        isWorkspaceMember: true,
      }),
    ).toBe(false);
  });

  it("rejects users outside the workspace", () => {
    expect(
      canReadProject({
        visibility: "workspace",
        isProjectMember: false,
        isWorkspaceMember: false,
      }),
    ).toBe(false);
  });
});

describe("canWriteProject", () => {
  it("allows members to write and rejects viewers without a project role", () => {
    expect(canWriteProject("member", "member")).toBe(true);
    expect(canWriteProject("viewer", "member")).toBe(false);
    expect(canWriteProject(null, "member")).toBe(false);
  });
});
