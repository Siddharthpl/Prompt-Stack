import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";

export default function PromptSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <Skeleton className="h-4 w-full my-4" />
      <Skeleton className="h-2 w-full mb-1" />
      <Skeleton className="h-2 w-[50%] mb-4" />
      <Skeleton className="w-full h-32 rounded-lg flex items-center justify-center mb-2">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </Skeleton>
      <div className="flex flex-wrap gap-1 mb-6 mt-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-between space-x-4 mb-2">
        <Skeleton className="h-2 w-16" />
        <Skeleton className="h-2 w-16" />
      </div>
    </div>
  );
}
