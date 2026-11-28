"use client";

import { useOptimistic, useTransition } from "react";
import {
    Banknote,
    ListOrdered,
    type LucideIcon,
    Pencil,
    Percent,
    Trash2,
    Users,
} from "lucide-react";
import type { LoanItem } from "@/app/actions/loans/loan.types";
import { setLoanActive } from "@/app/actions/loans/loans";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { FREQUENCY_LABELS, INTEREST_METHOD_LABELS } from "@/lib/constants/loan";
import { baht } from "@/lib/format";
import { cn } from "@/lib/utils";

type LoanCardProps = {
    loan: LoanItem;
    onEdit: (loan: LoanItem) => void;
    onDelete: (loan: LoanItem) => void;
};

export function LoanCard({ loan, onEdit, onDelete }: LoanCardProps) {
    const [active, setActive] = useOptimistic(loan.active);
    const [, startTransition] = useTransition();

    function handleToggle(next: boolean) {
        startTransition(async () => {
            setActive(next);
            const res = await setLoanActive(loan.id, next);

            if (res.ok) {
                toast.add({
                    title: next
                        ? "เปิดการใช้งานสินเชื่อ"
                        : "ปิดการใช้งานสินเชื่อ",
                    description: loan.name,
                    type: "success",
                });
            } else {
                toast.add({
                    title: "ไม่สามารถเปลี่ยนสถานะสินเชื่อได้",
                    description: res.error,
                    type: "error",
                });
            }
        });
    }

    const details: { label: string; value: string; icon: LucideIcon }[] = [
        {
            label: "วงเงินต่อราย",
            value: `${baht(loan.minAmount)} – ${baht(loan.maxAmount)}`,
            icon: Banknote,
        },
        {
            label: "ดอกเบี้ย",
            value: `${loan.interestRate}% ต่อปี`,
            icon: Percent,
        },
    ];

    return (
        <Card className="gap-4 rounded-3xl p-4">
            <div className="flex items-center gap-3">
                <Avatar
                    className={cn(
                        "size-12 rounded-xl transition-[filter] after:rounded-xl",
                        !active && "grayscale",
                    )}
                >
                    {loan.imageUrl && (
                        <AvatarImage
                            src={loan.imageUrl}
                            alt=""
                            className="rounded-xl object-cover"
                        />
                    )}
                    <AvatarFallback className="rounded-xl font-semibold">
                        {loan.name.slice(0, 1)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{loan.name}</h3>
                    <p className="truncate text-xs text-muted-foreground">
                        {FREQUENCY_LABELS[loan.frequency]} ·{" "}
                        {INTEREST_METHOD_LABELS[loan.interestMethod]}
                    </p>
                </div>
                <Switch
                    checked={active}
                    onCheckedChange={handleToggle}
                    aria-label={`${loan.name} active`}
                />
            </div>

            {/* Body fades when the loan is closed; the header switch stays fully visible. */}
            <div
                className={cn(
                    "grid gap-4 transition-opacity",
                    !active && "opacity-60",
                )}
            >
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            วงเงินคงเหลือ
                        </p>
                        <p className="text-2xl font-bold tracking-tight tabular-nums">
                            {baht(loan.availableAmount)}
                        </p>
                    </div>
                    {active ? (
                        <Badge>เปิดรับ</Badge>
                    ) : (
                        <Badge variant="secondary">ปิดใช้งาน</Badge>
                    )}
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border p-3">
                    {details.map((d) => (
                        <div
                            key={d.label}
                            className="flex min-w-0 items-center gap-2.5"
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <d.icon className="size-4" />
                            </span>
                            <div className="grid min-w-0 gap-0.5">
                                <dt className="text-xs text-muted-foreground">
                                    {d.label}
                                </dt>
                                <dd className="truncate text-sm font-semibold tabular-nums">
                                    {d.value}
                                </dd>
                            </div>
                        </div>
                    ))}
                </dl>

                <div className="grid gap-1.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ListOrdered className="size-3.5" />
                        จำนวนงวดที่เลือกได้
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {loan.installments.map((n) => (
                            <Badge
                                variant="outline"
                                key={n}
                                className="tabular-nums"
                            >
                                {n} งวด
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            <div className="-mx-4 -mb-4 flex min-h-13 items-center justify-between gap-2 border-t px-4 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                    <Users className="size-4 shrink-0" />
                    <span className="truncate">
                        {loan.openDebtCount > 0
                            ? `กำลังผ่อน ${loan.openDebtCount.toLocaleString("th-TH")} ราย`
                            : "ยังไม่มีผู้กู้"}
                    </span>
                </span>
                <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${loan.name}`}
                        onClick={() => onEdit(loan)}
                    >
                        <Pencil />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${loan.name}`}
                        onClick={() => onDelete(loan)}
                    >
                        <Trash2 className="text-destructive" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
