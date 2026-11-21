"use client";

import { useOptimistic, useTransition } from "react";
import Image from "next/image";
import type { LoanItem } from "@/app/actions/loans/loan.types";
import {
    FREQUENCY_LABELS,
    INTEREST_METHOD_LABELS,
} from "@/app/(main)/manage/loans/lib/loan.constants";
import { setLoanActive } from "@/app/actions/loans/loans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { ImageIcon, Pencil, Trash2 } from "lucide-react";

type LoanCardProps = {
    loan: LoanItem;
    onEdit: (loan: LoanItem) => void;
    onDelete: (loan: LoanItem) => void;
};

const baht = (n: number) => `฿${n.toLocaleString()}`;

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

    return (
        <Card
            className={`gap-0 overflow-hidden rounded-3xl p-0 transition-opacity ${
                active ? "" : "opacity-60"
            }`}
        >
            <div className="relative aspect-square w-full bg-muted">
                {loan.imageUrl ? (
                    <Image
                        src={loan.imageUrl}
                        alt={loan.name}
                        fill
                        sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="size-10" />
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold">
                            {loan.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {baht(loan.minAmount)} – {baht(loan.maxAmount)}
                        </p>
                    </div>
                    <Switch
                        checked={active}
                        onCheckedChange={handleToggle}
                        aria-label={`${loan.name} active`}
                    />
                </div>
                <div className="flex flex-wrap gap-1.5">
                    <Badge>{FREQUENCY_LABELS[loan.frequency]}</Badge>
                    <Badge variant="secondary">
                        {INTEREST_METHOD_LABELS[loan.interestMethod]} ·{" "}
                        {loan.interestRate}% ต่อปี
                    </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {loan.installments.map((n) => (
                        <Badge key={n} variant="outline">
                            {n} งวด
                        </Badge>
                    ))}
                </div>
                <div className="flex justify-end gap-1">
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
