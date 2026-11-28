import { Skeleton } from "@/components/ui/skeleton";

export function HomeSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <Skeleton className="h-80 rounded-3xl" />
                <Skeleton className="h-80 rounded-3xl" />
            </div>

            <div className="mt-2 flex justify-between">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-6 w-18" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-60 rounded-3xl" />
                ))}
            </div>
        </div>
    );
}
