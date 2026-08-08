import { fromUnixDate, toUnixDate } from "@/lib/api/schemas";
import { validationError } from "@/lib/api/errors";
import type { AppDatabase } from "@/lib/db/client";
import { listTasksInDateRange } from "@/lib/repositories/insights-repository";

export async function getCalendarEvents(
  db: AppDatabase,
  userId: string,
  input: {
    start: string;
    end: string;
    projectId?: string;
    assigneeId?: string;
  },
) {
  const startUnix = toUnixDate(input.start);
  const endUnix = toUnixDate(input.end);
  if (startUnix === null || endUnix === null) {
    throw validationError("start and end are required ISO dates");
  }

  // Inclusive end-of-day for date-only strings.
  const endInclusive = endUnix + 24 * 60 * 60 - 1;

  const rows = await listTasksInDateRange(db, userId, startUnix, endInclusive, {
    projectId: input.projectId,
    assigneeId: input.assigneeId,
  });

  return rows.map((row) => {
    const date = fromUnixDate(row.dueDate)?.slice(0, 10) ?? input.start;
    return {
      id: row.id,
      type: "task" as const,
      title: row.title,
      start: date,
      end: date,
      priority: row.priority,
      status: row.status,
      projectId: row.projectId,
      projectName: row.projectName,
      assigneeId: row.assigneeId,
    };
  });
}
