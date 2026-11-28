import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function UserAvatar({
    name,
    picture,
    initials = 1,
    className,
    fallbackClassName,
}: {
    name: string | null;
    picture: string | null;
    initials?: number;
    className?: string;
    fallbackClassName?: string;
}) {
    return (
        <Avatar className={className}>
            {picture && <AvatarImage src={picture} alt="" />}
            <AvatarFallback className={cn("font-semibold", fallbackClassName)}>
                {(name ?? "?").slice(0, initials).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );
}
