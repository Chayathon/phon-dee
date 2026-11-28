"use client";

import { deleteDebtor } from "@/app/actions/debtors/debtor";
import type { DebtorItem } from "@/app/actions/debtors/debtor.types";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";

export function DebtorDeleteDialog({
    debtor,
    onClose,
}: {
    debtor: DebtorItem | null;
    onClose: () => void;
}) {
    return (
        <ConfirmDeleteDialog
            target={debtor}
            onClose={onClose}
            onConfirm={(d) => deleteDebtor(d.id)}
            title={(d) => (
                <>
                    ยืนยันที่จะลบหนี้ของ <strong>{d.userName}</strong>?
                </>
            )}
            description="ตารางงวดชำระทั้งหมดจะถูกลบด้วย และไม่สามารถกู้คืนได้"
            confirmLabel="ลบหนี้"
            successTitle="ลบลูกหนี้สำเร็จ"
            errorTitle="ไม่สามารถลบลูกหนี้ได้"
            describe={(d) => d.userName ?? d.loanName}
        />
    );
}
