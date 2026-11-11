"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LoanItem } from "@/app/actions/loans/loan.types";
import { LoanCard } from "./loan-card";
import { LoanDeleteDialog } from "./loan-delete-dialog";
import { LoanEmpty } from "./loan-empty";
import { LoanFormDrawer } from "./loan-form-drawer";

export function LoanList({ loans }: { loans: LoanItem[] }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState<LoanItem | undefined>();
    const [deleting, setDeleting] = useState<LoanItem | null>(null);

    function openDrawer(loan?: LoanItem) {
        setEditing(loan);
        setDrawerOpen(true);
    }

    return (
        <>
            {loans.length === 0 ? (
                <LoanEmpty />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {loans.map((loan) => (
                        <LoanCard
                            key={loan.id}
                            loan={loan}
                            onEdit={openDrawer}
                            onDelete={setDeleting}
                        />
                    ))}
                </div>
            )}

            <Button
                size="icon-lg"
                aria-label="Add loan"
                className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 size-14 rounded-full shadow-lg lg:bottom-6 lg:right-6"
                onClick={() => openDrawer()}
            >
                <Plus className="size-6" />
            </Button>

            <LoanFormDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                loan={editing}
            />

            <LoanDeleteDialog
                loan={deleting}
                onClose={() => setDeleting(null)}
            />
        </>
    );
}
