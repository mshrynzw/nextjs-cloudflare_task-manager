import { describe, expect, it } from "vitest";
import { calculateProjectProgress } from "@/features/project/utils/progress";
import {
  formatProjectDeadline,
  getInitials,
  isDeadlineOverdue,
} from "@/features/project/utils/labels";

describe("calculateProjectProgress", () => {
  it("returns 0 when there are no tasks", () => {
    expect(calculateProjectProgress(0, 0)).toBe(0);
  });

  it("rounds completed over total to a percentage", () => {
    expect(calculateProjectProgress(3, 1)).toBe(33);
    expect(calculateProjectProgress(4, 3)).toBe(75);
    expect(calculateProjectProgress(10, 10)).toBe(100);
  });
});

describe("project label helpers", () => {
  it("formats ISO deadlines as YYYY-MM-DD", () => {
    expect(formatProjectDeadline("2026-09-30T00:00:00.000Z")).toBe(
      "2026-09-30",
    );
    expect(formatProjectDeadline(null)).toBeNull();
  });

  it("detects overdue deadlines", () => {
    expect(isDeadlineOverdue("2020-01-01", new Date("2026-08-08"))).toBe(true);
    expect(isDeadlineOverdue("2099-01-01", new Date("2026-08-08"))).toBe(false);
  });

  it("builds initials from a display name", () => {
    expect(getInitials("Aria Whitfield")).toBe("AW");
    expect(getInitials("")).toBe("?");
  });
});
