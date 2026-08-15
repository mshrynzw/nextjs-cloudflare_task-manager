"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { BoardColumn } from "@/features/task/components/board-column";
import { BoardColumnTabs } from "@/features/task/components/board-mobile-nav";
import {
  CreateTaskButton,
  CreateTaskDialog,
} from "@/features/task/components/create-task-dialog";
import { TaskCard } from "@/features/task/components/task-card";
import { moveTaskAction } from "@/features/task/actions";
import {
  TASK_STATUSES,
  groupTasksByStatus,
  isTaskStatus,
  type BoardMember,
  type BoardTask,
  type TaskStatus,
} from "@/features/task/types";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchEmptyState } from "@/components/feedback/search-empty-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { useI18n } from "@/components/providers/locale-provider";
import { HelpCircle, ListTodo } from "lucide-react";

interface TaskBoardProps {
  projectId: string;
  initialTasks: BoardTask[];
  members: BoardMember[];
  search?: string;
  priority?: string;
  canEdit?: boolean;
}

function cloneBoard(
  board: Record<TaskStatus, BoardTask[]>,
): Record<TaskStatus, BoardTask[]> {
  return {
    backlog: [...board.backlog],
    todo: [...board.todo],
    in_progress: [...board.in_progress],
    review: [...board.review],
    done: [...board.done],
  };
}

function findContainer(
  board: Record<TaskStatus, BoardTask[]>,
  id: string,
): TaskStatus | null {
  if (isTaskStatus(id)) {
    return id;
  }
  for (const status of TASK_STATUSES) {
    if (board[status].some((task) => task.id === id)) {
      return status;
    }
  }
  return null;
}

function normalizeColumn(tasks: BoardTask[], status: TaskStatus): BoardTask[] {
  return tasks.map((task, index) => ({
    ...task,
    status,
    position: index + 1,
  }));
}

export function TaskBoard({
  projectId,
  initialTasks,
  members,
  search = "",
  priority = "",
  canEdit = true,
}: TaskBoardProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [board, setBoard] = useState(() => groupTasksByStatus(initialTasks));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);
  const [mobileStatus, setMobileStatus] = useState<TaskStatus>("todo");
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
  );

  const filteredBoard = useMemo(() => {
    const query = search.trim().toLowerCase();
    const next = {} as Record<TaskStatus, BoardTask[]>;
    for (const status of TASK_STATUSES) {
      next[status] = board[status].filter((task) => {
        if (priority && task.priority !== priority) {
          return false;
        }
        if (!query) {
          return true;
        }
        return (
          task.title.toLowerCase().includes(query) ||
          (task.description?.toLowerCase().includes(query) ?? false)
        );
      });
    }
    return next;
  }, [board, search, priority]);

  const activeTask = useMemo(() => {
    if (!activeId) {
      return null;
    }
    for (const status of TASK_STATUSES) {
      const found = board[status].find((task) => task.id === activeId);
      if (found) {
        return found;
      }
    }
    return null;
  }, [activeId, board]);

  const filteredCount = useMemo(
    () =>
      TASK_STATUSES.reduce(
        (total, status) => total + filteredBoard[status].length,
        0,
      ),
    [filteredBoard],
  );
  const totalCount = useMemo(
    () =>
      TASK_STATUSES.reduce((total, status) => total + board[status].length, 0),
    [board],
  );
  const hasFilters = Boolean(search.trim() || priority);
  const persistMove = useCallback(
    (
      previous: Record<TaskStatus, BoardTask[]>,
      next: Record<TaskStatus, BoardTask[]>,
      taskId: string,
      status: TaskStatus,
    ) => {
      const position = next[status].findIndex((task) => task.id === taskId) + 1;
      startTransition(async () => {
        const result = await moveTaskAction({
          projectId,
          taskId,
          status,
          position,
        });
        if (result.status === "error") {
          setBoard(previous);
          setError(result.message ?? t.board.moveFailed);
          return;
        }
        setError(null);
        router.refresh();
      });
    },
    [projectId, router, t.board.moveFailed],
  );

  function handleStatusChange(taskId: string, status: TaskStatus) {
    setBoard((current) => {
      const previous = cloneBoard(current);
      const from = findContainer(current, taskId);
      if (!from || from === status) {
        return current;
      }
      const task = current[from].find((item) => item.id === taskId);
      if (!task) {
        return current;
      }
      const next: Record<TaskStatus, BoardTask[]> = {
        ...current,
        [from]: normalizeColumn(
          current[from].filter((item) => item.id !== taskId),
          from,
        ),
        [status]: normalizeColumn(
          [...current[status], { ...task, status }],
          status,
        ),
      };
      persistMove(previous, next, taskId, status);
      return next;
    });
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeIdValue = String(active.id);
    const overIdValue = String(over.id);

    setBoard((current) => {
      const activeContainer = findContainer(current, activeIdValue);
      const overContainer = findContainer(current, overIdValue);
      if (
        !activeContainer ||
        !overContainer ||
        activeContainer === overContainer
      ) {
        return current;
      }

      const activeTasks = current[activeContainer];
      const overTasks = current[overContainer];
      const activeIndex = activeTasks.findIndex(
        (task) => task.id === activeIdValue,
      );
      if (activeIndex < 0) {
        return current;
      }

      const moving = {
        ...activeTasks[activeIndex]!,
        status: overContainer,
      };

      let newIndex = overTasks.findIndex((task) => task.id === overIdValue);
      if (isTaskStatus(overIdValue)) {
        newIndex = overTasks.length;
      } else if (newIndex < 0) {
        newIndex = overTasks.length;
      }

      return {
        ...current,
        [activeContainer]: activeTasks.filter(
          (task) => task.id !== activeIdValue,
        ),
        [overContainer]: [
          ...overTasks.slice(0, newIndex),
          moving,
          ...overTasks.slice(newIndex),
        ],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) {
      return;
    }

    const activeIdValue = String(active.id);
    const overIdValue = String(over.id);

    setBoard((current) => {
      const previous = cloneBoard(current);
      const activeContainer = findContainer(current, activeIdValue);
      const overContainer = findContainer(current, overIdValue);
      if (!activeContainer || !overContainer) {
        return current;
      }

      let next = current;

      if (activeContainer === overContainer) {
        const items = [...current[activeContainer]];
        const oldIndex = items.findIndex((task) => task.id === activeIdValue);
        const newIndex = isTaskStatus(overIdValue)
          ? oldIndex
          : items.findIndex((task) => task.id === overIdValue);
        if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
          next = {
            ...current,
            [activeContainer]: normalizeColumn(
              arrayMove(items, oldIndex, newIndex),
              activeContainer,
            ),
          };
        } else {
          next = {
            ...current,
            [activeContainer]: normalizeColumn(items, activeContainer),
          };
        }
      } else {
        next = {
          ...current,
          [activeContainer]: normalizeColumn(
            current[activeContainer],
            activeContainer,
          ),
          [overContainer]: normalizeColumn(
            current[overContainer],
            overContainer,
          ),
        };
      }

      const status = findContainer(next, activeIdValue);
      if (!status) {
        return current;
      }
      persistMove(previous, next, activeIdValue, status);
      return next;
    });
  }

  return (
    <div className={isPending ? "opacity-90" : undefined}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-sm text-zinc-500">{t.board.hint}</p>
          <Popover>
            <PopoverTrigger
              className="inline-flex size-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
              aria-label={t.board.tips}
            >
              <HelpCircle className="size-4" aria-hidden />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64">
              <PopoverTitle>{t.board.tips}</PopoverTitle>
              <PopoverDescription>{t.board.tipsBody}</PopoverDescription>
            </PopoverContent>
          </Popover>
        </div>
        {canEdit ? (
          <CreateTaskButton
            projectId={projectId}
            members={members}
            onCreated={() => router.refresh()}
          />
        ) : (
          <p className="text-xs text-zinc-500">{t.project.viewOnlyNotice}</p>
        )}
      </div>

      {error ? (
        <p className="mb-3 text-sm text-rose-400" role="alert">
          {error}
        </p>
      ) : null}

      {totalCount > 0 ? (
        <BoardColumnTabs
          activeStatus={mobileStatus}
          counts={{
            backlog: filteredBoard.backlog.length,
            todo: filteredBoard.todo.length,
            in_progress: filteredBoard.in_progress.length,
            review: filteredBoard.review.length,
            done: filteredBoard.done.length,
          }}
          onSelect={setMobileStatus}
        />
      ) : null}
      {totalCount === 0 ? (
        <EmptyState
          title={t.board.noTasksTitle}
          description={t.board.noTasksDescription}
          icon={<ListTodo className="size-6" aria-hidden />}
        />
      ) : null}

      {totalCount > 0 && filteredCount === 0 && hasFilters ? (
        <SearchEmptyState
          title={t.board.noMatchingTitle}
          description={t.board.noMatchingDescription}
        />
      ) : null}

      {totalCount > 0 && !(filteredCount === 0 && hasFilters) ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-4 md:flex">
            {TASK_STATUSES.map((status) => (
              <div
                key={status}
                id={`board-panel-${status}`}
                role="tabpanel"
                aria-labelledby={`board-tab-${status}`}
                className={
                  status === mobileStatus
                    ? "w-full shrink-0 md:w-auto"
                    : "hidden md:block"
                }
                data-column-status={status}
              >
                <BoardColumn
                  status={status}
                  tasks={filteredBoard[status]}
                  projectId={projectId}
                  members={members}
                  onStatusChange={handleStatusChange}
                  onAddTask={setCreateStatus}
                  canEdit={canEdit}
                />
              </div>
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                projectId={projectId}
                members={members}
                isDragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : null}

      <CreateTaskDialog
        projectId={projectId}
        members={members}
        defaultStatus={createStatus ?? mobileStatus}
        open={createStatus !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreateStatus(null);
          }
        }}
        onCreated={() => {
          setCreateStatus(null);
          router.refresh();
        }}
      />
    </div>
  );
}
