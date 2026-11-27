"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/guard";
import { FORBIDDEN, fail, type ActionResult } from "@/lib/action";
import { toDate, toIso, today } from "@/lib/date";
import {
    calculateInstallment,
    principalSchedule,
    roundMoney,
} from "@/lib/interest";
import {
    adjustLoanBalance,
    drawFromLoan,
    returnToLoan,
} from "@/lib/loan-balance";
import { pushMessage } from "@/lib/line";
import { parseDebtorForm } from "@/app/actions/debtors/debtor.parsers";
import {
    summaryMessage,
    type ReminderItem,
} from "@/app/actions/debtors/debtor.flex";
import {
    dueInstallments,
    dueStatus,
    sumAmount,
} from "@/app/actions/debtors/debtor.due";
import type {
    BulkRemindResult,
    DebtorFields,
    DebtorInstallment,
    DebtorItem,
    UserOption,
} from "@/app/actions/debtors/debtor.types";
import type { Frequency, InterestMethod } from "@/app/actions/loans/loan.types";

dayjs.extend(utc);

const PATH = "/manage/debtors";

function revalidate() {
    revalidatePath(PATH);
    revalidatePath("/manage/loans");
}

type LoanTerms = {
    frequency: string;
    interestMethod: string;
    interestRate: number;
};

/**
 * Due date of installment `i` (UTC). Always counts from `first`, so a short
 * month doesn't shift later dates: Jan 31 → Feb 28 → Mar 31.
 */
function dueDate(first: Date, i: number, frequency: Frequency): Date {
    const start = dayjs.utc(first);
    if (frequency === "MONTHLY") return start.add(i, "month").toDate();
    return start.add((frequency === "WEEKLY" ? 1 : 2) * i, "week").toDate();
}

/**
 * Installment rows for a new debt: the same payment each period, principal
 * split evenly (the last row absorbs rounding), and due dates from `dueDate`.
 */
function buildSchedule(debtId: string, loan: LoanTerms, fields: DebtorFields) {
    const terms = {
        principal: fields.amount,
        annualRate: loan.interestRate,
        installments: fields.installments,
        frequency: loan.frequency as Frequency,
        method: loan.interestMethod as InterestMethod,
    };
    const { payment } = calculateInstallment({
        ...terms,
        roundUp: fields.roundUp,
    });
    const principals = principalSchedule(fields.amount, fields.installments);
    const first = toDate(fields.firstDueDate);
    return principals.map((principal, i) => ({
        debtId,
        amount: payment,
        principal,
        dueDate: dueDate(first, i, terms.frequency),
    }));
}

export async function listUsers(): Promise<UserOption[]> {
    if (!(await isAdmin())) return [];

    return prisma.user.findMany({
        // where: { role: "USER" },
        select: { id: true, name: true, picture: true },
        orderBy: { name: "asc" },
    });
}

export async function listDebtors(): Promise<DebtorItem[]> {
    if (!(await isAdmin())) return [];

    const debts = await prisma.debt.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true, picture: true } },
            loan: { select: { name: true, frequency: true } },
            installmentItems: { orderBy: { dueDate: "asc" } },
        },
    });

    const todayIso = today();
    const sum = (rows: DebtorInstallment[], key: "amount" | "principal") =>
        roundMoney(rows.reduce((total, r) => total + r[key], 0));

    return debts.map((d) => {
        const rows = d.installmentItems;
        const nextUnpaid = rows.find((r) => !r.paid);
        const schedule: DebtorInstallment[] = rows.map((r, i) => ({
            id: r.id,
            no: i + 1,
            amount: r.amount,
            principal: r.principal,
            dueDate: toIso(r.dueDate),
            paid: r.paid,
            overdue: !r.paid && toIso(r.dueDate) < todayIso,
        }));
        const unpaid = schedule.filter((s) => !s.paid);
        return {
            id: d.id,
            userId: d.userId,
            userName: d.user.name,
            userPicture: d.user.picture,
            loanId: d.loanId,
            loanName: d.loan.name,
            frequency: d.loan.frequency as Frequency,
            amount: d.amount,
            installments: d.installments,
            payment: rows[0]?.amount ?? 0,
            paidCount: rows.filter((r) => r.paid).length,
            firstDueDate: rows[0] ? toIso(rows[0].dueDate) : "",
            nextDueDate: nextUnpaid ? toIso(nextUnpaid.dueDate) : null,
            paidAmount: sum(
                schedule.filter((s) => s.paid),
                "amount",
            ),
            remaining: sum(unpaid, "amount"),
            outstandingPrincipal: sum(unpaid, "principal"),
            schedule,
        };
    });
}

export async function createDebtor(formData: FormData): Promise<ActionResult> {
    if (!(await isAdmin())) return FORBIDDEN;

    const userId = String(formData.get("userId") ?? "");
    const loanId = String(formData.get("loanId") ?? "");

    try {
        const [user, loan] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.loan.findUnique({ where: { id: loanId } }),
        ]);
        if (!user) return { ok: false, error: "ไม่พบผู้ใช้งาน" };
        if (!loan || !loan.active)
            return {
                ok: false,
                error: "ไม่พบสินเชื่อหรือสินเชื่อถูกปิดใช้งาน",
            };

        const parsed = parseDebtorForm(formData, loan);
        if (!parsed.ok) return parsed;
        const fields = parsed.data;

        await prisma.$transaction(async (tx) => {
            await drawFromLoan(tx, loanId, fields.amount);
            const debt = await tx.debt.create({
                data: {
                    userId,
                    loanId,
                    amount: fields.amount,
                    installments: fields.installments,
                },
            });
            await tx.installment.createMany({
                data: buildSchedule(debt.id, loan, fields),
            });
        });

        revalidate();
        return { ok: true };
    } catch (e) {
        return fail(e);
    }
}

export async function updateDebtor(
    id: string,
    formData: FormData,
): Promise<ActionResult> {
    if (!(await isAdmin())) return FORBIDDEN;

    try {
        const debt = await prisma.debt.findUnique({
            where: { id },
            include: { loan: true },
        });
        if (!debt) return { ok: false, error: "ไม่พบลูกหนี้" };
        const { loan } = debt;

        const parsed = parseDebtorForm(formData, loan);
        if (!parsed.ok) return parsed;
        const fields = parsed.data;

        const paid = await prisma.$transaction(async (tx) => {
            const paidCount = await tx.installment.count({
                where: { debtId: id, paid: true },
            });
            if (paidCount > 0) return paidCount;

            await adjustLoanBalance(
                tx,
                debt.loanId,
                debt.amount - fields.amount,
            );
            await tx.debt.update({
                where: { id },
                data: {
                    amount: fields.amount,
                    installments: fields.installments,
                },
            });
            await tx.installment.deleteMany({ where: { debtId: id } });
            await tx.installment.createMany({
                data: buildSchedule(id, loan, fields),
            });
            return 0;
        });
        if (paid > 0)
            return {
                ok: false,
                error: "ไม่สามารถแก้ไขได้ เนื่องจากมีการชำระงวดแล้ว",
            };

        revalidate();
        return { ok: true };
    } catch (e) {
        return fail(e);
    }
}

export async function deleteDebtor(id: string): Promise<ActionResult> {
    if (!(await isAdmin())) return FORBIDDEN;

    try {
        await prisma.$transaction(async (tx) => {
            const debt = await tx.debt.findUnique({ where: { id } });
            if (!debt) throw new Error("ไม่พบลูกหนี้");

            const { _sum } = await tx.installment.aggregate({
                where: { debtId: id, paid: false },
                _sum: { principal: true },
            });
            await returnToLoan(tx, debt.loanId, _sum.principal ?? 0);

            await tx.debt.delete({ where: { id } });
        });

        revalidate();
        return { ok: true };
    } catch (e) {
        return fail(e);
    }
}

/** Upper bound per call; LINE push is one request per recipient. */
const MAX_BULK_REMIND = 200;

export async function remindDebtors(ids: string[]): Promise<BulkRemindResult> {
    if (!(await isAdmin())) return { ok: false, error: "Forbidden" };

    const unique = [...new Set(ids)];
    if (unique.length === 0)
        return { ok: false, error: "กรุณาเลือกลูกหนี้อย่างน้อย 1 รายการ" };
    if (unique.length > MAX_BULK_REMIND)
        return {
            ok: false,
            error: `ส่งได้ครั้งละไม่เกิน ${MAX_BULK_REMIND} รายการ`,
        };

    try {
        const debts = await prisma.debt.findMany({
            where: { id: { in: unique } },
            include: {
                user: { select: { name: true } },
                loan: { select: { name: true } },
                installmentItems: { orderBy: { dueDate: "asc" } },
            },
        });

        const todayIso = today();
        const byUser = new Map<
            string,
            { userName: string | null; items: ReminderItem[] }
        >();
        for (const debt of debts) {
            const rows = debt.installmentItems.map((r, i) => ({
                no: i + 1,
                amount: r.amount,
                dueDate: toIso(r.dueDate),
                paid: r.paid,
            }));
            const group = byUser.get(debt.userId) ?? {
                userName: debt.user.name,
                items: [],
            };
            for (const r of dueInstallments(rows, todayIso)) {
                group.items.push({
                    loanName: debt.loan.name,
                    borrowed: debt.amount,
                    installmentNo: r.no,
                    installmentCount: rows.length,
                    amount: r.amount,
                    dueIso: r.dueDate,
                    status: dueStatus(r.dueDate, todayIso),
                });
            }
            if (group.items.length > 0) byUser.set(debt.userId, group);
        }
        if (byUser.size === 0)
            return { ok: false, error: "ลูกหนี้ที่เลือกชำระครบทุกงวดแล้ว" };

        const groups = [...byUser].map(([userId, g]) => {
            const items = g.items.toSorted((a, b) =>
                a.dueIso.localeCompare(b.dueIso),
            );
            return {
                userId,
                userName: g.userName,
                items,
                total: sumAmount(items),
            };
        });

        const results = await Promise.all(
            groups.map((g) => pushMessage(g.userId, [summaryMessage(g)])),
        );

        const sent = groups.filter((_, i) => results[i].ok);
        const failed = groups.flatMap((g, i) => {
            const r = results[i];
            return r.ok
                ? []
                : [{ name: g.userName ?? "ไม่ระบุชื่อ", error: r.error }];
        });

        return {
            ok: true,
            sentUsers: sent.length,
            sentItems: sent.reduce((n, g) => n + g.items.length, 0),
            sentTotal: sumAmount(sent.map((g) => ({ amount: g.total }))),
            failed,
        };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : "Something went wrong",
        };
    }
}

export async function payInstallment(
    installmentId: string,
): Promise<ActionResult> {
    if (!(await isAdmin())) return FORBIDDEN;

    try {
        await prisma.$transaction(async (tx) => {
            const { count } = await tx.installment.updateMany({
                where: { id: installmentId, paid: false },
                data: { paid: true },
            });
            if (count === 0) {
                const exists = await tx.installment.count({
                    where: { id: installmentId },
                });
                throw new Error(
                    exists ? "งวดนี้ชำระแล้ว" : "ไม่พบงวดที่ต้องการชำระ",
                );
            }

            const { principal, debt } = await tx.installment.findUniqueOrThrow({
                where: { id: installmentId },
                select: { principal: true, debt: { select: { loanId: true } } },
            });
            await returnToLoan(tx, debt.loanId, principal);
        });

        revalidate();
        return { ok: true };
    } catch (e) {
        return fail(e);
    }
}
