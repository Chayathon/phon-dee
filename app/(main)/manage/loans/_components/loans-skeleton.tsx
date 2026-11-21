import { Skeleton } from "@/components/ui/skeleton";

export function LoansSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-136 rounded-3xl" />
            ))}
        </div>
    );
}
