import { Suspense } from "react";
import { listDebtors, listUsers } from "@/app/actions/debtors/debtor";
import { listLoans } from "@/app/actions/loans/loans";
import { DebtorList } from "./_components/debtor-list";
import { DebtorsSkeleton } from "./_components/debtors-skeleton";

async function Debtors() {
    const [debtors, users, loans] = await Promise.all([
        listDebtors(),
        listUsers(),
        listLoans(),
    ]);
    return <DebtorList debtors={debtors} users={users} loans={loans} />;
}

export default function DebtorsPage() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <Suspense fallback={<DebtorsSkeleton />}>
                <Debtors />
            </Suspense>
        </div>
    );
}
