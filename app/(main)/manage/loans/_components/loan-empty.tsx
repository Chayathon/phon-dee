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
        <div className="py-12">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Landmark className="size-12" />
                    </EmptyMedia>
                    <EmptyTitle>ไม่มีตัวเลือกสินเชื่อ</EmptyTitle>
                    <EmptyDescription>
                        เพิ่มตัวเลือกสินเชื่อใหม่เพื่อให้ลูกหนี้สามารถขอสินเชื่อได้
                    </EmptyDescription>
                    <EmptyDescription></EmptyDescription>
                </EmptyHeader>
            </Empty>
        </div>
    );
}
