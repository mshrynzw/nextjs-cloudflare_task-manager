"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  addCommentAction,
  type TaskActionState,
} from "@/features/task/actions";
import { getInitials } from "@/features/project/utils/labels";

const initialState: TaskActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Posting…" : "Post comment"}
    </Button>
  );
}

interface CommentsSectionProps {
  projectId: string;
  taskId: string;
  comments: Array<{
    id: string;
    content: string;
    authorId: string;
    authorName: string | null;
    authorImage: string | null;
    createdAt: number;
  }>;
}

export function CommentsSection({
  projectId,
  taskId,
  comments,
}: CommentsSectionProps) {
  const router = useRouter();
  const boundAdd = addCommentAction.bind(null, projectId, taskId);
  const [state, formAction] = useActionState(boundAdd, initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <h2 className="mb-4 text-sm font-medium text-zinc-200">Comments</h2>

      {comments.length === 0 ? (
        <p className="mb-4 text-sm text-zinc-500">No comments yet.</p>
      ) : (
        <ul className="mb-4 space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-200">
                  {getInitials(comment.authorName)}
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-200">
                    {comment.authorName ?? "Member"}
                  </p>
                  <p className="text-[10px] tabular-nums text-zinc-500">
                    {new Date(comment.createdAt * 1000).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm text-zinc-300">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="space-y-2">
        <label className="block">
          <span className="sr-only">Comment</span>
          <textarea
            name="content"
            required
            rows={3}
            maxLength={5000}
            placeholder="Write a comment…"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus-visible:border-violet-500/50"
          />
        </label>
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
      {state.status === "error" ? (
        <p className="mt-2 text-sm text-rose-400" role="alert">
          {state.message}
        </p>
      ) : null}
    </section>
  );
}
