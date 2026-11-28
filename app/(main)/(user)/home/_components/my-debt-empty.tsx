import { WalletCards } from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

export function MyDebtEmpty() {
    return (
        <Empty className="py-18">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <WalletCards className="size-12" />
                </EmptyMedia>
                <EmptyTitle>ยังไม่มีรายการหนี้</EmptyTitle>
                <EmptyDescription>
                    เมื่อสินเชื่อของคุณได้รับอนุมัติ รายการผ่อนชำระจะแสดงที่นี่
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
