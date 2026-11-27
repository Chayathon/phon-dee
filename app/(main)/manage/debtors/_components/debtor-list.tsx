"use client";

import { useState } from "react";
import { MessagesSquare, Plus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
    DebtorItem,
    UserOption,
} from "@/app/actions/debtors/debtor.types";
import type { LoanItem } from "@/app/actions/loans/loan.types";
import { baht } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DebtorRemindDialog, summarizeReminders } from "./debtor-remind-dialog";
import { DebtorCard } from "./debtor-card";
import { DebtorDeleteDialog } from "./debtor-delete-dialog";
import { DebtorDetailDrawer } from "./debtor-detail-drawer";
import { DebtorEmpty } from "./debtor-empty";
import { DebtorFormDrawer } from "./debtor-form-drawer";

type DebtorListProps = {
    debtors: DebtorItem[];
    users: UserOption[];
    loans: LoanItem[];
};

export function DebtorList({ debtors, users, loans }: DebtorListProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState<DebtorItem | undefined>();
    const [deleting, setDeleting] = useState<DebtorItem | null>(null);
    const [reminding, setReminding] = useState<DebtorItem[] | null>(null);

    const [viewingId, setViewingId] = useState<string | undefined>();
    const [detailOpen, setDetailOpen] = useState(false);
    const viewing = debtors.find((d) => d.id === viewingId);

    const [selecting, setSelecting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const remindable = debtors.filter((d) => d.paidCount < d.installments);
    const selected = remindable.filter((d) => selectedIds.has(d.id));
    const summary = summarizeReminders(selected);
    const allSelected =
        remindable.length > 0 && selected.length === remindable.length;

    function toggleSelect(debtor: DebtorItem) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (!next.delete(debtor.id)) next.add(debtor.id);
            return next;
        });
    }

    function toggleAll() {
        setSelectedIds(
            allSelected ? new Set() : new Set(remindable.map((d) => d.id)),
        );
    }

    function exitSelecting() {
        setSelecting(false);
        setSelectedIds(new Set());
    }

    function openDetail(debtor: DebtorItem) {
        setViewingId(debtor.id);
        setDetailOpen(true);
    }

    function openDrawer(debtor?: DebtorItem) {
        setEditing(debtor);
        setDrawerOpen(true);
    }

    return (
        <>
            {remindable.length > 0 && (
                <div className="flex items-center justify-end gap-2">
                    {selecting ? (
                        <>
                            <span className="mr-auto text-sm text-muted-foreground">
                                เลือกแล้ว {selected.length} รายการ
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleAll}
                            >
                                {allSelected ? "ล้างที่เลือก" : "เลือกทั้งหมด"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exitSelecting}
                            >
                                <X />
                                ยกเลิก
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelecting(true)}
                        >
                            <MessagesSquare />
                            ส่งข้อความหลายรายการ
                        </Button>
                    )}
                </div>
            )}

            {debtors.length === 0 ? (
                <DebtorEmpty />
            ) : (
                <div
                    className={cn(
                        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
                        selecting && "pb-24",
                    )}
                >
                    {debtors.map((debtor) => (
                        <DebtorCard
                            key={debtor.id}
                            debtor={debtor}
                            onView={openDetail}
                            onEdit={openDrawer}
                            onDelete={setDeleting}
                            onRemind={(d) => setReminding([d])}
                            selecting={selecting}
                            selected={selectedIds.has(debtor.id)}
                            onToggleSelect={toggleSelect}
                        />
                    ))}
                </div>
            )}

            {selecting ? (
                <div className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 rounded-2xl border bg-background p-3 shadow-lg lg:bottom-6 lg:left-auto lg:right-6 lg:w-96">
                    <div className="grid min-w-0 flex-1">
                        <span className="text-xs text-muted-foreground">
                            {summary.groups.length} คน · {summary.items} รายการ
                        </span>
                        <span className="text-lg font-bold tabular-nums">
                            {baht(summary.total)}
                        </span>
                    </div>
                    <Button
                        disabled={selected.length === 0}
                        onClick={() => setReminding(selected)}
                    >
                        <Send data-icon="inline-start" />
                        ส่งข้อความ
                    </Button>
                </div>
            ) : (
                <Button
                    size="icon-lg"
                    aria-label="Add debtor"
                    className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 size-14 rounded-full shadow-lg lg:bottom-6 lg:right-6"
                    onClick={() => openDrawer()}
                >
                    <Plus className="size-6" />
                </Button>
            )}

            <DebtorFormDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                debtor={editing}
                users={users}
                loans={loans}
            />

            <DebtorDetailDrawer
                open={detailOpen && viewing !== undefined}
                onOpenChange={setDetailOpen}
                debtor={viewing}
            />

            <DebtorDeleteDialog
                debtor={deleting}
                onClose={() => setDeleting(null)}
            />

            <DebtorRemindDialog
                debtors={reminding}
                onClose={() => setReminding(null)}
                onSent={() => selecting && exitSelecting()}
            />
        </>
    );
}
