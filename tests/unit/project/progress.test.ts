import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROGRESS_WEIGHTS,
  areProgressWeightsValid,
  calculateProjectProgress,
  parseProgressWeights,
  resolveProgressWeights,
} from "@/lib/project/progress";
import {
  formatProjectDeadline,
  getInitials,
  isDeadlineOverdue,
} from "@/features/project/utils/labels";

describe("calculateProjectProgress", () => {
  it("returns 0 when there are no tasks", () => {
    expect(
      calculateProjectProgress({
        backlog: 0,
        todo: 0,
        in_progress: 0,
        review: 0,
        done: 0,
      }),
    ).toBe(0);
  });

  it("uses default status weights", () => {
    expect(
      calculateProjectProgress({
        backlog: 2,
        todo: 2,
        in_progress: 2,
        review: 2,
        done: 2,
      }),
    ).toBe(50);
  });

  it("stays at 100 when every task is done", () => {
    expect(
      calculateProjectProgress({
        backlog: 0,
        todo: 0,
        in_progress: 0,
        review: 0,
        done: 10,
      }),
    ).toBe(100);
  });

  it("applies project-specific weights", () => {
    expect(
      calculateProjectProgress(
        {
          backlog: 0,
          todo: 0,
          in_progress: 1,
          review: 0,
          done: 0,
        },
        {
          backlog: 0,
          todo: 0,
          in_progress: 1,
          review: 1,
          done: 1,
        },
      ),
    ).toBe(100);
  });
});

describe("progress weights", () => {
  it("resolves null to defaults", () => {
    expect(resolveProgressWeights(null)).toEqual(DEFAULT_PROGRESS_WEIGHTS);
  });

  it("parses valid stored JSON", () => {
    const raw = JSON.stringify({
      backlog: 0,
      todo: 0.25,
      in_progress: 0.5,
      review: 0.75,
      done: 1,
    });
    expect(parseProgressWeights(raw)).toEqual({
      backlog: 0,
      todo: 0.25,
      in_progress: 0.5,
      review: 0.75,
      done: 1,
    });
  });

  it("rejects decreasing weights", () => {
    expect(
      areProgressWeightsValid({
        backlog: 0,
        todo: 0.8,
        in_progress: 0.2,
        review: 0.9,
        done: 1,
      }),
    ).toBe(false);
  });

  it("falls back when stored JSON is invalid", () => {
    expect(resolveProgressWeights("{not-json")).toEqual(
      DEFAULT_PROGRESS_WEIGHTS,
    );
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
