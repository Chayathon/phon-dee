import { Landmark } from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

export function LoanEmpty() {
    return (
        <Empty className="py-18">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Landmark className="size-12" />
                </EmptyMedia>
                <EmptyTitle>ไม่มีตัวเลือกสินเชื่อ</EmptyTitle>
                <EmptyDescription>
                    เพิ่มตัวเลือกสินเชื่อใหม่เพื่อให้ลูกหนี้สามารถขอสินเชื่อได้
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
