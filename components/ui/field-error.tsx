import * as React from "react"
import { cn } from "cn"

function FieldError({
  errors,
  className,
  ...props
}: Omit<React.ComponentProps<"p">, "children"> & { errors?: string[] }) {
  if (!errors?.length) return null

  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {errors[0]}
    </p>
  )
}

export { FieldError }
