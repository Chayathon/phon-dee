"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "cn"

type StepState = "completed" | "active" | "inactive"

type StepperContextValue = {
  value: number
  onValueChange?: (value: number) => void
}

type StepperItemContextValue = {
  step: number
  state: StepState
  disabled: boolean
}

const StepperContext = React.createContext<StepperContextValue | null>(null)
const StepperItemContext =
  React.createContext<StepperItemContextValue | null>(null)

function useStepper() {
  const context = React.useContext(StepperContext)
  if (!context) throw new Error("useStepper must be used within <Stepper>")
  return context
}

function useStepperItem() {
  const context = React.useContext(StepperItemContext)
  if (!context)
    throw new Error("useStepperItem must be used within <StepperItem>")
  return context
}

/**
 * Horizontal step indicator. `value` is the current step (1-based); steps
 * before it are completed. Pass `onValueChange` to make steps clickable.
 */
function Stepper({
  value,
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<"ol">, "onChange"> & StepperContextValue) {
  return (
    <StepperContext.Provider value={{ value, onValueChange }}>
      <ol
        data-slot="stepper"
        className={cn("flex w-full items-start", className)}
        {...props}
      />
    </StepperContext.Provider>
  )
}

function StepperItem({
  step,
  completed,
  disabled = false,
  className,
  ...props
}: React.ComponentProps<"li"> & {
  step: number
  /** Overrides the completed state derived from the stepper's value. */
  completed?: boolean
  disabled?: boolean
}) {
  const { value } = useStepper()
  const state: StepState =
    (completed ?? step < value)
      ? "completed"
      : step === value
        ? "active"
        : "inactive"

  return (
    <StepperItemContext.Provider value={{ step, state, disabled }}>
      <li
        data-slot="stepper-item"
        data-state={state}
        data-disabled={disabled || undefined}
        className={cn(
          "group/stepper-item relative flex flex-1 flex-col items-center",
          className
        )}
        {...props}
      />
    </StepperItemContext.Provider>
  )
}

function StepperTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { onValueChange } = useStepper()
  const { step, state, disabled } = useStepperItem()

  return (
    <button
      type="button"
      data-slot="stepper-trigger"
      aria-current={state === "active" ? "step" : undefined}
      disabled={disabled || !onValueChange}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) onValueChange?.(step)
      }}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-lg text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50 enabled:cursor-pointer disabled:cursor-default",
        className
      )}
      {...props}
    />
  )
}

function StepperIndicator({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  const { step, state } = useStepperItem()

  return (
    <span
      data-slot="stepper-indicator"
      data-state={state}
      className={cn(
        "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums transition-colors [&_svg]:size-3.5",
        "data-[state=inactive]:border-border data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground",
        "data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:ring-3 data-[state=active]:ring-primary/20",
        "data-[state=completed]:border-primary data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground",
        className
      )}
      {...props}
    >
      {children ?? (state === "completed" ? <CheckIcon /> : step)}
    </span>
  )
}

function StepperTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-title"
      className={cn(
        "text-xs font-medium text-foreground group-data-[state=inactive]/stepper-item:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function StepperDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * Line connecting this step's indicator to the next one. Hidden on the last
 * item, so it can be rendered unconditionally.
 */
function StepperSeparator({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="stepper-separator"
      className={cn(
        "absolute top-3.5 right-[calc(-50%+1.25rem)] left-[calc(50%+1.25rem)] h-px bg-border transition-colors group-last/stepper-item:hidden group-data-[state=completed]/stepper-item:bg-primary",
        className
      )}
      {...props}
    />
  )
}

export {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
  useStepper,
  useStepperItem,
}
