/**
 * Progress is derived from tasks and must not be stored in the database.
 */
export function calculateProjectProgress(
  totalTasks: number,
  completedTasks: number,
): number {
  if (totalTasks <= 0) {
    return 0;
  }
  return Math.round((completedTasks / totalTasks) * 100);
}
