"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import type { ActionResult } from "@/lib/action";

type ConfirmDeleteDialogProps<T> = {
    /** The item to delete; `null` closes the dialog. */
    target: T | null;
    onClose: () => void;
    onConfirm: (target: T) => Promise<ActionResult>;
    title: (target: T) => ReactNode;
    description: ReactNode;
    confirmLabel: string;
    successTitle: string;
    errorTitle: string;
    describe: (target: T) => string;
};

export function ConfirmDeleteDialog<T>({
    target,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel,
    successTitle,
    errorTitle,
    describe,
}: ConfirmDeleteDialogProps<T>) {
    const [pending, startTransition] = useTransition();
    const [shown, setShown] = useState(target);
    if (target !== null && target !== shown) setShown(target);

    function confirmDelete() {
        if (target === null) return;
        const item = target;

        startTransition(async () => {
            const res = await onConfirm(item);
            toast.add(
                res.ok
                    ? {
                          title: successTitle,
                          description: describe(item),
                          type: "success",
                      }
                    : {
                          title: errorTitle,
                          description: res.error,
                          type: "error",
                      },
            );
            onClose();
        });
    }

    return (
        <AlertDialog
            open={target !== null}
            onOpenChange={(open) => !open && !pending && onClose()}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {shown !== null && title(shown)}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending}>
                        ยกเลิก
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={pending}
                        onClick={confirmDelete}
                    >
                        {pending ? (
                            <Spinner data-icon="inline-start" />
                        ) : (
                            <Trash2 data-icon="inline-start" />
                        )}
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
