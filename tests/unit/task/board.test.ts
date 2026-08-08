import { describe, expect, it } from "vitest";
import {
  groupTasksByStatus,
  isTaskStatus,
  type BoardTask,
} from "@/features/task/types";

function task(partial: Partial<BoardTask> & Pick<BoardTask, "id" | "status">): BoardTask {
  return {
    title: partial.title ?? partial.id,
    description: null,
    priority: "medium",
    projectId: "project_1",
    assigneeId: null,
    dueDate: null,
    position: partial.position ?? 1,
    updatedAt: 1,
    ...partial,
  };
}

describe("groupTasksByStatus", () => {
  it("groups and sorts tasks by status and position", () => {
    const groups = groupTasksByStatus([
      task({ id: "a", status: "todo", position: 2 }),
      task({ id: "b", status: "todo", position: 1 }),
      task({ id: "c", status: "done", position: 1 }),
    ]);

    expect(groups.todo.map((item) => item.id)).toEqual(["b", "a"]);
    expect(groups.done).toHaveLength(1);
    expect(groups.backlog).toHaveLength(0);
  });

  it("falls back unknown statuses into todo", () => {
    const groups = groupTasksByStatus([
      task({ id: "x", status: "mystery" }),
    ]);
    expect(groups.todo.map((item) => item.id)).toEqual(["x"]);
  });
});

describe("isTaskStatus", () => {
  it("accepts known kanban statuses", () => {
    expect(isTaskStatus("in_progress")).toBe(true);
    expect(isTaskStatus("blocked")).toBe(false);
  });
});
