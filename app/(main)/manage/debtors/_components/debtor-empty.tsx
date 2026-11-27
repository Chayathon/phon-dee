import { Users } from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

export function DebtorEmpty() {
    return (
        <div className="py-12">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Users className="size-12" />
                    </EmptyMedia>
                    <EmptyTitle>ยังไม่มีลูกหนี้</EmptyTitle>
                    <EmptyDescription>
                        กดปุ่ม + เพื่อเพิ่มลูกหนี้รายแรก
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        </div>
    );
}
