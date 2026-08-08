import { BoardSkeleton } from "@/components/feedback/skeleton";

export default function BoardLoading() {
  return (
    <div className="flex-1 px-4 py-6 sm:px-6">
      <BoardSkeleton />
    </div>
  );
}
