import { Skeleton } from "@/components/ui/skeleton";

export function DebtorsSkeleton() {
    return (
        <>
            <div className="flex justify-end">
                <Skeleton className="h-7 w-40 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-54 rounded-3xl" />
                ))}
            </div>
        </>
    );
}
