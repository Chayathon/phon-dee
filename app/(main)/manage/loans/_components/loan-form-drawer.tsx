"use client";

import { useState, useTransition } from "react";
import { createLoan, updateLoan } from "@/app/actions/loans/loans";
import { parseLoanForm } from "@/app/actions/loans/loan.parsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    FREQUENCIES,
    FREQUENCY_LABELS,
} from "@/app/(main)/manage/loans/lib/loan.constants";
import type {
    Frequency,
    LoanFields,
    LoanItem,
} from "@/app/actions/loans/loan.types";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";

const INSTALLMENT_PRESETS = [1, 2, 3, 4, 5, 6, 9, 12, 18, 24, 30, 36];

type LoanFormDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    loan?: LoanItem;
};

export function LoanFormDrawer({
    open,
    onOpenChange,
    loan,
}: LoanFormDrawerProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
            <DrawerContent>
                <LoanForm
                    key={loan?.id ?? "new"}
                    loan={loan}
                    onDone={() => onOpenChange(false)}
                />
            </DrawerContent>
        </Drawer>
    );
}

function LoanForm({ loan, onDone }: { loan?: LoanItem; onDone: () => void }) {
    const [frequency, setFrequency] = useState<Frequency>(
        loan?.frequency ?? "MONTHLY",
    );
    const [installments, setInstallments] = useState<number[]>(
        loan?.installments ?? [],
    );
    const [preview, setPreview] = useState<string | null>(
        loan?.imageUrl ?? null,
    );
    const [errors, setErrors] = useState<
        Partial<Record<keyof LoanFields, string[]>>
    >({});
    const [pending, startTransition] = useTransition();

    const installmentOptions = [
        ...new Set([...INSTALLMENT_PRESETS, ...(loan?.installments ?? [])]),
    ].sort((a, b) => a - b);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set("frequency", frequency);
        installments.forEach((n) => formData.append("installments", String(n)));
        const parsed = parseLoanForm(formData);

        if (!parsed.ok) {
            setErrors(parsed.fieldErrors);
            return;
        }
        setErrors({});
        setPreview(null);

        startTransition(async () => {
            const res = loan
                ? await updateLoan(loan.id, formData)
                : await createLoan(formData);
            if (res.ok) {
                toast.add({
                    title: loan
                        ? "แก้ไขสินเชื่อสำเร็จ"
                        : "สร้างสินเชื่อใหม่สำเร็จ",
                    description: String(formData.get("name")),
                    type: "success",
                });
                onDone();
            } else
                toast.add({
                    title: "ไม่สามารถบันทึกข้อมูลสินเชื่อได้",
                    description: res.error,
                    type: "error",
                });
        });
    }

    return (
        <>
            <DrawerHeader>
                <DrawerTitle>
                    {loan ? "แก้ไขสินเชื่อ" : "เพิ่มสินเชื่อใหม่"}
                </DrawerTitle>
                <DrawerDescription>
                    {loan
                        ? "แก้ไขข้อมูลสินเชื่อ"
                        : "สร้างสินเชื่อใหม่เพื่อให้ผู้ใช้งานสามารถเลือกกู้ได้"}
                </DrawerDescription>
            </DrawerHeader>
            <form
                onSubmit={handleSubmit}
                noValidate
                className="flex min-h-0 flex-col gap-5 overflow-y-auto p-4"
            >
                <div className="grid gap-2">
                    <Label htmlFor="loan-name">ชื่อสินเชื่อ</Label>
                    <Input
                        id="loan-name"
                        name="name"
                        placeholder="สินเชื่อเงินด่วน"
                        defaultValue={loan?.name}
                        aria-invalid={!!errors.name}
                    />
                    <FieldError errors={errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="loan-image">รูปภาพ</Label>
                    {preview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={preview}
                            alt="Loan preview"
                            className="mx-auto lg:ml-2 my-2 aspect-square size-52 rounded-2xl object-cover drop-shadow-xl"
                        />
                    )}
                    <Input
                        id="loan-image"
                        name="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setPreview(URL.createObjectURL(file));
                        }}
                    />
                </div>

                <Label>วงเงินที่กู้ได้</Label>
                <div className="grid grid-cols-2 items-start gap-3">
                    <div className="grid gap-2">
                        <Label htmlFor="loan-min">ขั้นต่ำ</Label>
                        <InputGroup>
                            <InputGroupInput
                                id="loan-min"
                                name="minAmount"
                                placeholder="1000"
                                type="number"
                                inputMode="decimal"
                                min={1}
                                step="any"
                                defaultValue={loan?.minAmount}
                                aria-invalid={!!errors.minAmount}
                            />
                            <InputGroupAddon>฿</InputGroupAddon>
                        </InputGroup>
                        <FieldError errors={errors.minAmount} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="loan-max">สูงสุด</Label>
                        <InputGroup>
                            <InputGroupInput
                                id="loan-max"
                                name="maxAmount"
                                placeholder="40000"
                                type="number"
                                inputMode="decimal"
                                min={1}
                                step="any"
                                defaultValue={loan?.maxAmount}
                                aria-invalid={!!errors.maxAmount}
                            />
                            <InputGroupAddon>฿</InputGroupAddon>
                        </InputGroup>
                        <FieldError errors={errors.maxAmount} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>รอบชำระ</Label>
                    <ToggleGroup
                        variant="outline"
                        value={[frequency]}
                        onValueChange={(v) =>
                            v[0] && setFrequency(v[0] as Frequency)
                        }
                    >
                        {FREQUENCIES.map((f) => (
                            <ToggleGroupItem key={f} value={f}>
                                {FREQUENCY_LABELS[f]}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>

                <div className="grid gap-2">
                    <Label>จำนวนงวดที่ให้บริการ</Label>
                    <ToggleGroup
                        multiple
                        variant="outline"
                        className="w-full flex-wrap"
                        value={installments.map(String)}
                        onValueChange={(v) =>
                            setInstallments(v.map(Number).sort((a, b) => a - b))
                        }
                    >
                        {installmentOptions.map((n) => (
                            <ToggleGroupItem
                                key={n}
                                value={String(n)}
                                aria-label={`${n} installments`}
                            >
                                {n}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                    <FieldError errors={errors.installments} />
                </div>

                <Button type="submit" size="lg" disabled={pending}>
                    {pending ? "กำลังบันทึก…" : "บันทึก"}
                </Button>
            </form>
        </>
    );
}
