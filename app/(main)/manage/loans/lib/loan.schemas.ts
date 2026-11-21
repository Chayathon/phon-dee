import { z } from "zod";

import { FREQUENCIES, INTEREST_METHODS } from "./loan.constants";

export const loanSchema = z
    .object({
        name: z.string().trim().min(1, "กรุณากรอกชื่อสินเชื่อ"),
        minAmount: z.coerce
            .number()
            .positive("กรุณากรอกจำนวนเงินขั้นต่ำ")
            .min(1, "จำนวนเงินขั้นต่ำต้องมากกว่า 0"),
        maxAmount: z.coerce
            .number()
            .positive("กรุณากรอกจำนวนเงินสูงสุด")
            .min(1, "จำนวนเงินสูงสุดต้องมากกว่า 0"),
        frequency: z.enum(FREQUENCIES, "รอบชำระไม่ถูกต้อง"),
        interestMethod: z.enum(INTEREST_METHODS, "วิธีคิดดอกเบี้ยไม่ถูกต้อง"),
        interestRate: z.coerce
            .number("กรุณากรอกอัตราดอกเบี้ย")
            .min(0, "อัตราดอกเบี้ยต้องไม่ติดลบ")
            .max(100, "อัตราดอกเบี้ยต้องไม่เกิน 100%"),
        installments: z
            .array(z.coerce.number().int().positive())
            .min(1, "กรุณาเลือกอย่างน้อยหนึ่งรอบชำระ")
            .transform((a) => [...new Set(a)].sort((x, y) => x - y)),
        image: z
            .instanceof(File)
            .nullable()
            .transform((f) => (f && f.size > 0 ? f : null)),
    })
    .refine((v) => v.maxAmount > v.minAmount, {
        message: "จำนวนเงินสูงสุดต้องมากกว่าจำนวนเงินขั้นต่ำ",
        path: ["maxAmount"],
    });
