import { describe, expect, it } from "vitest";
import { parseProjectEditForm } from "@/features/project/utils/parse-project-edit-form";

function form(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    data.set(key, value);
  }
  return data;
}

const defaultWeights = {
  progressWeight_backlog: "0",
  progressWeight_todo: "20",
  progressWeight_in_progress: "50",
  progressWeight_review: "80",
  progressWeight_done: "100",
};

describe("parseProjectEditForm", () => {
  it("parses a valid edit payload with progress weights", () => {
    const parsed = parseProjectEditForm(
      form({
        name: "Website Renewal",
        description: "Client site refresh",
        status: "active",
        priority: "high",
        color: "#4f7cff",
        deadline: "2026-12-31",
        ...defaultWeights,
      }),
    );

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      return;
    }
    expect(parsed.data).toEqual({
      name: "Website Renewal",
      description: "Client site refresh",
      status: "active",
      priority: "high",
      color: "#4f7cff",
      deadline: "2026-12-31",
      progressWeights: {
        backlog: 0,
        todo: 0.2,
        in_progress: 0.5,
        review: 0.8,
        done: 1,
      },
    });
  });

  it("clears empty description and deadline to null", () => {
    const parsed = parseProjectEditForm(
      form({
        name: "Solo",
        description: "",
        status: "planning",
        priority: "medium",
        color: "#112233",
        deadline: "",
        ...defaultWeights,
      }),
    );

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      return;
    }
    expect(parsed.data.description).toBeNull();
    expect(parsed.data.deadline).toBeNull();
  });

  it("rejects an empty name", () => {
    const parsed = parseProjectEditForm(
      form({
        name: "   ",
        status: "active",
        priority: "low",
        color: "#4f7cff",
        ...defaultWeights,
      }),
    );

    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid color", () => {
    const parsed = parseProjectEditForm(
      form({
        name: "Bad color",
        status: "active",
        priority: "low",
        color: "blue",
        ...defaultWeights,
      }),
    );

    expect(parsed.success).toBe(false);
  });

  it("rejects decreasing progress weights", () => {
    const parsed = parseProjectEditForm(
      form({
        name: "Bad weights",
        status: "active",
        priority: "low",
        color: "#4f7cff",
        progressWeight_backlog: "0",
        progressWeight_todo: "80",
        progressWeight_in_progress: "50",
        progressWeight_review: "80",
        progressWeight_done: "100",
      }),
    );

    expect(parsed.success).toBe(false);
  });

  it("rejects progress weights outside 0–100", () => {
    const parsed = parseProjectEditForm(
      form({
        name: "Out of range",
        status: "active",
        priority: "low",
        color: "#4f7cff",
        progressWeight_backlog: "0",
        progressWeight_todo: "20",
        progressWeight_in_progress: "50",
        progressWeight_review: "80",
        progressWeight_done: "120",
      }),
    );

    expect(parsed.success).toBe(false);
  });
});
