"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, CalendarDays, Check } from "lucide-react";
import { createDebtor, updateDebtor } from "@/app/actions/debtors/debtor";
import { parseDebtorForm } from "@/app/actions/debtors/debtor.parsers";
import type {
    DebtorFields,
    DebtorItem,
    UserOption,
} from "@/app/actions/debtors/debtor.types";
import type { LoanItem } from "@/app/actions/loans/loan.types";
import { FREQUENCY_LABELS, INTEREST_METHOD_LABELS } from "@/lib/constants/loan";
import { thaiDate, toDate, toIso } from "@/lib/date";
import { baht } from "@/lib/format";
import { calculateInstallment } from "@/lib/interest";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Stepper,
    StepperIndicator,
    StepperItem,
    StepperSeparator,
    StepperTitle,
    StepperTrigger,
} from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type DebtorFormDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    debtor?: DebtorItem;
    users: UserOption[];
    loans: LoanItem[];
};

export function DebtorFormDrawer({
    open,
    onOpenChange,
    debtor,
    users,
    loans,
}: DebtorFormDrawerProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
            <DrawerContent>
                <DebtorWizard
                    key={debtor?.id ?? "new"}
                    debtor={debtor}
                    users={users}
                    loans={loans}
                    onDone={() => onOpenChange(false)}
                />
            </DrawerContent>
        </Drawer>
    );
}

const STEP_TITLES = ["เลือกผู้ใช้งาน", "เลือกสินเชื่อ", "กรอกรายละเอียด"];

function DebtorWizard({
    debtor,
    users,
    loans,
    onDone,
}: Omit<DebtorFormDrawerProps, "open" | "onOpenChange"> & {
    onDone: () => void;
}) {
    const [step, setStep] = useState(debtor ? 3 : 1);
    const [user, setUser] = useState<UserOption | undefined>(
        debtor
            ? {
                  id: debtor.userId,
                  name: debtor.userName,
                  picture: debtor.userPicture,
              }
            : undefined,
    );
    const [loan, setLoan] = useState<LoanItem | undefined>(
        debtor ? loans.find((l) => l.id === debtor.loanId) : undefined,
    );

    return (
        <>
            <DrawerHeader>
                <DrawerTitle>
                    {debtor ? "แก้ไขลูกหนี้" : "เพิ่มลูกหนี้ใหม่"}
                </DrawerTitle>
                <DrawerDescription className={debtor ? undefined : "sr-only"}>
                    {debtor
                        ? `${debtor.userName ?? ""} · ${debtor.loanName}`
                        : `ขั้นตอนที่ ${step}/3 · ${STEP_TITLES[step - 1]}`}
                </DrawerDescription>
                {!debtor && (
                    <Stepper
                        value={step}
                        onValueChange={setStep}
                        aria-label="ขั้นตอนการเพิ่มลูกหนี้"
                        className="pt-3"
                    >
                        {STEP_TITLES.map((title, i) => (
                            <StepperItem
                                key={title}
                                step={i + 1}
                                disabled={i + 1 > step}
                            >
                                <StepperTrigger>
                                    <StepperIndicator />
                                    <StepperTitle>{title}</StepperTitle>
                                </StepperTrigger>
                                <StepperSeparator />
                            </StepperItem>
                        ))}
                    </Stepper>
                )}
            </DrawerHeader>

            {step === 1 && (
                <UserStep
                    users={users}
                    onSelect={(u) => {
                        setUser(u);
                        setStep(2);
                    }}
                />
            )}
            {step === 2 && (
                <LoanStep
                    loans={loans.filter((l) => l.active)}
                    onBack={() => setStep(1)}
                    onSelect={(l) => {
                        setLoan(l);
                        setStep(3);
                    }}
                />
            )}
            {step === 3 && user && loan && (
                <DetailsStep
                    debtor={debtor}
                    user={user}
                    loan={loan}
                    onBack={debtor ? undefined : () => setStep(2)}
                    onDone={onDone}
                />
            )}
            {step === 3 && user && !loan && (
                <p className="p-4 text-sm text-destructive">
                    ไม่พบสินเชื่อของลูกหนี้รายนี้
                </p>
            )}
        </>
    );
}

function UserStep({
    users,
    onSelect,
}: {
    users: UserOption[];
    onSelect: (user: UserOption) => void;
}) {
    const [query, setQuery] = useState("");
    const q = query.trim().toLowerCase();
    const filtered = users.filter((u) =>
        (u.name ?? "").toLowerCase().includes(q),
    );

    return (
        <div className="flex min-h-0 flex-col gap-3 p-4">
            <Input
                placeholder="ค้นหาชื่อผู้ใช้งาน"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex min-h-0 flex-col gap-1 overflow-y-auto">
                {filtered.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        ไม่พบผู้ใช้งาน
                    </p>
                )}
                {filtered.map((u) => (
                    <button
                        key={u.id}
                        type="button"
                        onClick={() => onSelect(u)}
                        className="flex items-center gap-3 rounded-xl p-2 text-left hover:bg-muted"
                    >
                        <Avatar>
                            {u.picture && (
                                <AvatarImage src={u.picture} alt="" />
                            )}
                            <AvatarFallback>
                                {(u.name ?? "?").slice(0, 1)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                            {u.name ?? "ไม่ระบุชื่อ"}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function LoanStep({
    loans,
    onBack,
    onSelect,
}: {
    loans: LoanItem[];
    onBack: () => void;
    onSelect: (loan: LoanItem) => void;
}) {
    return (
        <div className="flex min-h-0 flex-col gap-3 p-4">
            <Button
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={onBack}
            >
                <ArrowLeft /> ย้อนกลับ
            </Button>
            <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
                {loans.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        ไม่มีสินเชื่อที่เปิดใช้งาน
                    </p>
                )}
                {loans.map((l) => (
                    <button
                        key={l.id}
                        type="button"
                        onClick={() => onSelect(l)}
                        className="grid gap-1 rounded-2xl border p-3 text-left hover:bg-muted"
                    >
                        <span className="font-medium">{l.name}</span>
                        <span className="text-sm text-muted-foreground">
                            {baht(l.minAmount)} – {baht(l.maxAmount)} ·{" "}
                            {l.interestRate}% ต่อปี ·{" "}
                            {FREQUENCY_LABELS[l.frequency]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {INTEREST_METHOD_LABELS[l.interestMethod]} ·{" "}
                            {l.installments.join(", ")} งวด
                        </span>
                        <span className="text-xs text-muted-foreground">
                            เบิกได้คงเหลือ {baht(l.availableAmount)}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function DetailsStep({
    debtor,
    user,
    loan,
    onBack,
    onDone,
}: {
    debtor?: DebtorItem;
    user: UserOption;
    loan: LoanItem;
    onBack?: () => void;
    onDone: () => void;
}) {
    const [amount, setAmount] = useState(debtor ? String(debtor.amount) : "");
    const [installments, setInstallments] = useState<number | undefined>(
        debtor?.installments,
    );
    const [firstDueDate, setFirstDueDate] = useState(
        debtor?.firstDueDate ?? "",
    );
    const [roundUp, setRoundUp] = useState(
        debtor ? debtor.payment % 10 === 0 : true,
    );
    const available = loan.availableAmount + (debtor?.amount ?? 0);
    const maxAmount = Math.min(loan.maxAmount, available);

    const principal = Number(amount);
    const preview =
        principal > 0 && installments
            ? calculateInstallment({
                  principal,
                  annualRate: loan.interestRate,
                  installments,
                  frequency: loan.frequency,
                  method: loan.interestMethod,
                  roundUp,
              })
            : null;

    const [calendarOpen, setCalendarOpen] = useState(false);
    const [errors, setErrors] = useState<
        Partial<Record<keyof DebtorFields, string[]>>
    >({});
    const [pending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData();
        formData.set("userId", user.id);
        formData.set("loanId", loan.id);
        formData.set("amount", amount);
        formData.set("installments", String(installments ?? ""));
        formData.set("firstDueDate", firstDueDate);
        formData.set("roundUp", String(roundUp));

        const parsed = parseDebtorForm(formData, { ...loan, maxAmount });
        if (!parsed.ok) {
            setErrors(parsed.fieldErrors);
            return;
        }
        setErrors({});

        startTransition(async () => {
            const res = debtor
                ? await updateDebtor(debtor.id, formData)
                : await createDebtor(formData);
            if (res.ok) {
                toast.add({
                    title: debtor ? "แก้ไขลูกหนี้สำเร็จ" : "เพิ่มลูกหนี้สำเร็จ",
                    description: user.name ?? loan.name,
                    type: "success",
                });
                onDone();
            } else
                toast.add({
                    title: "ไม่สามารถบันทึกข้อมูลลูกหนี้ได้",
                    description: res.error,
                    type: "error",
                });
        });
    }

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="flex min-h-0 flex-col gap-5 overflow-y-auto p-4"
        >
            {onBack && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="self-start"
                    onClick={onBack}
                >
                    <ArrowLeft /> ย้อนกลับ
                </Button>
            )}

            <div className="grid gap-2">
                <Label htmlFor="debtor-amount">
                    จำนวนเงินที่กู้ ({baht(loan.minAmount)} – {baht(maxAmount)})
                </Label>
                <InputGroup>
                    <InputGroupInput
                        id="debtor-amount"
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min={loan.minAmount}
                        max={maxAmount}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        aria-invalid={!!errors.amount}
                    />
                    <InputGroupAddon>฿</InputGroupAddon>
                </InputGroup>
                <FieldError errors={errors.amount} />
                {available < loan.maxAmount && (
                    <p className="text-xs text-muted-foreground">
                        สินเชื่อนี้เบิกได้คงเหลือ {baht(available)}
                    </p>
                )}
            </div>

            <div className="grid gap-2">
                <Label>จำนวนงวด</Label>
                <ToggleGroup
                    variant="outline"
                    className="w-full flex-wrap"
                    value={installments ? [String(installments)] : []}
                    onValueChange={(v) =>
                        setInstallments(v[0] ? Number(v[0]) : undefined)
                    }
                >
                    {loan.installments.map((n) => (
                        <ToggleGroupItem key={n} value={String(n)}>
                            {n}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
                <FieldError errors={errors.installments} />
            </div>

            <div className="grid gap-2">
                <Label>วันที่ชำระงวดแรก</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger
                        render={
                            <Button
                                type="button"
                                variant="outline"
                                className="justify-start font-normal"
                                aria-invalid={!!errors.firstDueDate}
                            />
                        }
                    >
                        <CalendarDays />
                        {firstDueDate ? (
                            thaiDate(firstDueDate)
                        ) : (
                            <span className="text-muted-foreground">
                                เลือกวันที่
                            </span>
                        )}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            timeZone="UTC"
                            selected={
                                firstDueDate ? toDate(firstDueDate) : undefined
                            }
                            onSelect={(d) => {
                                if (d) setFirstDueDate(toIso(d));
                                setCalendarOpen(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
                <FieldError errors={errors.firstDueDate} />
            </div>

            <div className="flex items-center justify-between rounded-2xl border p-3">
                <div className="grid gap-0.5">
                    <Label htmlFor="debtor-round">ปัดเศษขึ้นเป็น 10 บาท</Label>
                    <span className="text-xs text-muted-foreground">
                        ปัดยอดชำระแต่ละงวดขึ้นเป็นหลัก 10 บาท
                    </span>
                </div>
                <Switch
                    id="debtor-round"
                    checked={roundUp}
                    onCheckedChange={setRoundUp}
                />
            </div>

            {preview && (
                <div className="grid gap-1 rounded-2xl bg-muted p-3 text-sm">
                    <div className="flex justify-between">
                        <span>ชำระต่องวด</span>
                        <strong>{baht(preview.payment)}</strong>
                    </div>
                    {preview.payment !== preview.rawPayment && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>ก่อนปัดเศษ</span>
                            <span>{baht(preview.rawPayment)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                        <span>ดอกเบี้ยรวม</span>
                        <span>{baht(preview.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>ยอดชำระรวม</span>
                        <span>{baht(preview.totalPayment)}</span>
                    </div>
                </div>
            )}

            <Button type="submit" size="lg" disabled={pending}>
                {pending ? (
                    <Spinner data-icon="inline-start" />
                ) : (
                    <Check data-icon="inline-start" />
                )}
                {pending ? "กำลังบันทึก…" : "บันทึก"}
            </Button>
        </form>
    );
}
