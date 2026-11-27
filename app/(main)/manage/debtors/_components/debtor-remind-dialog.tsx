"use client";

import { useTransition } from "react";
import { CalendarClock, CircleAlert, Send } from "lucide-react";
import { remindDebtors } from "@/app/actions/debtors/debtor";
import { dueInstallments, sumAmount } from "@/app/actions/debtors/debtor.due";
import type { DebtorItem } from "@/app/actions/debtors/debtor.types";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { today } from "@/lib/date";
import { baht } from "@/lib/format";

export type RemindGroup = {
    userId: string;
    userName: string | null;
    userPicture: string | null;
    items: number;
    overdue: number;
    dueToday: number;
    total: number;
};

export type RemindSummary = {
    groups: RemindGroup[];
    items: number;
    total: number;
};

export function summarizeReminders(debtors: DebtorItem[]): RemindSummary {
    const todayIso = today();
    const byUser = new Map<string, RemindGroup>();

    for (const d of debtors) {
        const due = dueInstallments(d.schedule, todayIso);

        if (due.length === 0) continue;
        const g = byUser.get(d.userId) ?? {
            userId: d.userId,
            userName: d.userName,
            userPicture: d.userPicture,
            items: 0,
            overdue: 0,
            dueToday: 0,
            total: 0,
        };

        g.items += due.length;
        g.overdue += due.filter((s) => s.dueDate < todayIso).length;
        g.dueToday += due.filter((s) => s.dueDate === todayIso).length;
        g.total = sumAmount([{ amount: g.total }, ...due]);
        byUser.set(d.userId, g);
    }

    const groups = [...byUser.values()].sort((a, b) => b.total - a.total);

    return {
        groups,
        items: groups.reduce((n, g) => n + g.items, 0),
        total: sumAmount(groups.map((g) => ({ amount: g.total }))),
    };
}

export function DebtorRemindDialog({
    debtors,
    onClose,
    onSent,
}: {
    debtors: DebtorItem[] | null;
    onClose: () => void;
    onSent?: () => void;
}) {
    const [pending, startTransition] = useTransition();
    const summary = summarizeReminders(debtors ?? []);
    const single = summary.groups.length === 1 ? summary.groups[0] : null;

    function confirmSend() {
        if (!debtors) return;

        const ids = debtors.map((d) => d.id);
        startTransition(async () => {
            const res = await remindDebtors(ids);
            if (!res.ok) {
                toast.add({
                    title: "ส่งข้อความไม่สำเร็จ",
                    description: res.error,
                    type: "error",
                });
                onClose();
                return;
            }

            const sentText = `ส่งถึง ${res.sentUsers} คน · ${res.sentItems} รายการ · รวม ${baht(res.sentTotal)}`;

            if (res.failed.length === 0) {
                toast.add({
                    title: "ส่งข้อความทวงชำระแล้ว",
                    description: sentText,
                    type: "success",
                });

                onSent?.();
                onClose();
            } else {
                const failedText = res.failed
                    .map((f) => `${f.name}: ${f.error}`)
                    .join(", ");

                toast.add({
                    title:
                        res.sentUsers > 0
                            ? `ส่งไม่สำเร็จ ${res.failed.length} คน`
                            : "ส่งข้อความไม่สำเร็จ",
                    description:
                        res.sentUsers > 0
                            ? `${sentText} · ล้มเหลว ${failedText}`
                            : failedText,
                    type: res.sentUsers > 0 ? "warning" : "error",
                });
                onClose();
            }
        });
    }

    return (
        <AlertDialog
            open={debtors !== null && debtors.length > 0}
            onOpenChange={(o) => !o && !pending && onClose()}
        >
            <AlertDialogContent size="lg">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {`ส่งข้อความทวงชำระ ${summary.groups.length} คน?`}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {single
                            ? "ระบบจะส่งข้อความทาง LINE สรุปงวดที่ครบกำหนดและยอดรวม"
                            : "ระบบจะส่งข้อความทาง LINE คนละ 1 ข้อความ สรุปงวดที่ครบกำหนดและยอดรวมของแต่ละคน"}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <ul className="-mx-1 grid max-h-64 gap-1.5 overflow-y-auto px-1">
                    {summary.groups.map((g) => {
                        const upcoming = g.items - g.overdue - g.dueToday;

                        return (
                            <li
                                key={g.userId}
                                className="flex items-center gap-3 rounded-xl bg-muted/60 p-2.5"
                            >
                                <Avatar>
                                    {g.userPicture && (
                                        <AvatarImage
                                            src={g.userPicture}
                                            alt=""
                                        />
                                    )}
                                    <AvatarFallback>
                                        {(g.userName ?? "?").slice(0, 1)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid min-w-0 flex-1 gap-1">
                                    <span className="truncate text-sm font-medium">
                                        {g.userName ?? "ไม่ระบุชื่อ"}
                                    </span>
                                    <div className="flex min-w-0 gap-1 overflow-hidden">
                                        {g.overdue > 0 && (
                                            <Badge variant="destructive">
                                                <CircleAlert data-icon="inline-start" />
                                                เลยกำหนด {g.overdue}
                                            </Badge>
                                        )}
                                        {g.dueToday > 0 && (
                                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                <CalendarClock data-icon="inline-start" />
                                                วันนี้ {g.dueToday}
                                            </Badge>
                                        )}
                                        {upcoming > 0 && (
                                            <Badge variant="secondary">
                                                งวดถัดไป {upcoming}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="grid shrink-0 justify-items-end gap-1 whitespace-nowrap">
                                    <span className="text-lg leading-5 font-semibold tabular-nums">
                                        {baht(g.total)}
                                    </span>
                                    <span className="text-xs leading-5 text-muted-foreground">
                                        {g.items} รายการ
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                {summary.groups.length > 1 && (
                    <div className="flex items-center justify-between border-t pt-3 text-sm">
                        <span className="text-muted-foreground">
                            รวม {summary.groups.length} คน · {summary.items}{" "}
                            รายการ
                        </span>
                        <span className="font-semibold tabular-nums">
                            {baht(summary.total)}
                        </span>
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending}>
                        ยกเลิก
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={pending || summary.groups.length === 0}
                        onClick={confirmSend}
                    >
                        {pending ? (
                            <Spinner data-icon="inline-start" />
                        ) : (
                            <Send data-icon="inline-start" />
                        )}
                        ส่งข้อความ
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
