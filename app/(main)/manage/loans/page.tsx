import { Suspense } from "react";
import { listLoans } from "@/app/actions/loans/loans";
import { LoanList } from "./_components/loan-list";
import { LoansSkeleton } from "./_components/loans-skeleton";

async function Loans() {
    const loans = await listLoans();
    return <LoanList loans={loans} />;
}

export default function LoansPage() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <Suspense fallback={<LoansSkeleton />}>
                <Loans />
            </Suspense>
        </div>
    );
}
