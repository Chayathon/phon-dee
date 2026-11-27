"use client";

import { useTransition } from "react";
import { deleteDebtor } from "@/app/actions/debtors/debtor";
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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import type { DebtorItem } from "@/app/actions/debtors/debtor.types";
import { Trash2 } from "lucide-react";

export function DebtorDeleteDialog({
    debtor,
    onClose,
}: {
    debtor: DebtorItem | null;
    onClose: () => void;
}) {
    const [pending, startTransition] = useTransition();

    function confirmDelete() {
        if (!debtor) return;
        const target = debtor;
        startTransition(async () => {
            const res = await deleteDebtor(target.id);
            if (res.ok) {
                toast.add({
                    title: "ลบลูกหนี้สำเร็จ",
                    description: target.userName ?? target.loanName,
                    type: "success",
                });
            } else {
                toast.add({
                    title: "ไม่สามารถลบลูกหนี้ได้",
                    description: res.error,
                    type: "error",
                });
            }
            onClose();
        });
    }

    return (
        <AlertDialog
            open={debtor !== null}
            onOpenChange={(open) => !open && !pending && onClose()}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ยืนยันที่จะลบหนี้ของ <strong>{debtor?.userName}</strong>
                        ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        ตารางงวดชำระทั้งหมดจะถูกลบด้วย และไม่สามารถกู้คืนได้
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending}>
                        ยกเลิก
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={pending}
                        onClick={confirmDelete}
                    >
                        {pending ? (
                            <Spinner data-icon="inline-start" />
                        ) : (
                            <Trash2 data-icon="inline-start" />
                        )}
                        ลบหนี้
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
