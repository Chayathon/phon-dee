"use client";

import type { LoanItem } from "@/app/actions/loans/loan.types";
import { deleteLoan } from "@/app/actions/loans/loans";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";

export function LoanDeleteDialog({
    loan,
    onClose,
}: {
    loan: LoanItem | null;
    onClose: () => void;
}) {
    return (
        <ConfirmDeleteDialog
            target={loan}
            onClose={onClose}
            onConfirm={(l) => deleteLoan(l.id)}
            title={(l) => (
                <>
                    ยืนยันที่จะลบสินเชื่อ <strong>{l.name}</strong>?
                </>
            )}
            description="การลบสินเชื่อนี้จะไม่สามารถกู้คืนได้"
            confirmLabel="ลบสินเชื่อ"
            successTitle="ลบสินเชื่อสำเร็จ"
            errorTitle="ไม่สามารถลบสินเชื่อได้"
            describe={(l) => l.name}
        />
    );
}
