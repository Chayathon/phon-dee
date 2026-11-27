"use client";

import { useState, useTransition } from "react";
import {
    CalendarDays,
    CircleAlert,
    HandCoins,
    Info,
    PiggyBank,
} from "lucide-react";
import { payInstallment } from "@/app/actions/debtors/debtor";
import type {
    DebtorInstallment,
    DebtorItem,
} from "@/app/actions/debtors/debtor.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { daysUntil, thaiDate } from "@/lib/date";
import { baht } from "@/lib/format";

/** Confirms recording a payment for one installment. */
export function DebtorPayDialog({
    debtor,
    installment,
    onClose,
}: {
    debtor: DebtorItem;
    installment: DebtorInstallment | null;
    onClose: () => void;
}) {
    const [pending, startTransition] = useTransition();
    const [shown, setShown] = useState(installment);
    if (installment && installment !== shown) setShown(installment);

    function confirmPay() {
        if (!installment) return;
        const target = installment;
        startTransition(async () => {
            const res = await payInstallment(target.id);
            if (res.ok) {
                toast.add({
                    title: "บันทึกการชำระสำเร็จ",
                    description: `งวดที่ ${target.no} · คืนวงเงิน ${baht(target.principal)}`,
                    type: "success",
                });
            } else {
                toast.add({
                    title: "ไม่สามารถบันทึกการชำระได้",
                    description: res.error,
                    type: "error",
                });
            }
            onClose();
        });
    }

    const overdueDays = shown?.overdue ? -daysUntil(shown.dueDate) : 0;

    return (
        <AlertDialog
            open={installment !== null}
            onOpenChange={(o) => !o && !pending && onClose()}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ยืนยันรับชำระงวดที่ {shown?.no}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {debtor.userName ?? "ลูกหนี้"} · {debtor.loanName}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {shown && (
                    <div className="grid gap-3 rounded-xl bg-muted/60 p-3.5">
                        <div className="grid gap-0.5">
                            <span className="text-xs text-muted-foreground">
                                ยอดชำระ
                            </span>
                            <span className="text-2xl font-bold tabular-nums">
                                {baht(shown.amount)}
                            </span>
                        </div>
                        <dl className="grid grid-cols-2 gap-3 border-t pt-3">
                            <div className="grid gap-0.5">
                                <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <CalendarDays className="size-3.5 shrink-0" />
                                    ครบกำหนด
                                </dt>
                                <dd className="text-sm font-semibold">
                                    {thaiDate(shown.dueDate)}
                                </dd>
                            </div>
                            <div className="grid gap-0.5">
                                <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <PiggyBank className="size-3.5 shrink-0" />
                                    คืนวงเงิน
                                </dt>
                                <dd className="text-sm font-semibold tabular-nums">
                                    {baht(shown.principal)}
                                </dd>
                            </div>
                        </dl>
                    </div>
                )}

                <Alert
                    variant="destructive"
                    className="border-destructive/30 bg-destructive/10"
                >
                    {overdueDays > 0 ? <CircleAlert /> : <Info />}
                    <AlertTitle>บันทึกแล้วจะยกเลิกภายหลังไม่ได้</AlertTitle>
                    {overdueDays > 0 && (
                        <AlertDescription>
                            งวดนี้เลยกำหนดมาแล้ว {overdueDays} วัน
                        </AlertDescription>
                    )}
                </Alert>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending}>
                        ยกเลิก
                    </AlertDialogCancel>
                    <AlertDialogAction disabled={pending} onClick={confirmPay}>
                        {pending ? (
                            <Spinner data-icon="inline-start" />
                        ) : (
                            <HandCoins data-icon="inline-start" />
                        )}
                        รับชำระ
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
