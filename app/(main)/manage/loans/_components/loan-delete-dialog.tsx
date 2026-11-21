"use client";

import { useTransition } from "react";
import { deleteLoan } from "@/app/actions/loans/loans";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import type { LoanItem } from "@/app/actions/loans/loan.types";

export function LoanDeleteDialog({
    loan,
    onClose,
}: {
    loan: LoanItem | null;
    onClose: () => void;
}) {
    const [pending, startTransition] = useTransition();

    function confirmDelete() {
        if (!loan) return;
        const target = loan;
        startTransition(async () => {
            const res = await deleteLoan(target.id);
            if (res.ok) {
                toast.add({
                    title: "ลบสินเชื่อสำเร็จ",
                    description: target.name,
                    type: "success",
                });
            } else {
                toast.add({
                    title: "ไม่สามารถลบสินเชื่อได้",
                    description: res.error,
                    type: "error",
                });
            }
            onClose();
        });
    }

    return (
        <AlertDialog
            open={loan !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ยืนยันที่จะลบสินเชื่อ <strong>{loan?.name}</strong>?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        การลบสินเชื่อนี้จะไม่สามารถกู้คืนได้
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={pending}
                        onClick={confirmDelete}
                    >
                        ลบสินเชื่อ
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
