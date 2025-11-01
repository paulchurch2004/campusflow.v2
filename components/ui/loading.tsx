import * as React from "react"
import { cn } from "@/lib/utils"

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the loading spinner
   * @default "md"
   */
  size?: "sm" | "md" | "lg" | "xl"
  /**
   * Optional loading text to display below the spinner
   */
  text?: string
  /**
   * Variant of the loading spinner
   * @default "default"
   */
  variant?: "default" | "primary" | "accent"
  /**
   * Whether to show the spinner in fullscreen mode
   * @default false
   */
  fullscreen?: boolean
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
  xl: "h-16 w-16 border-4",
}

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
}

const variantClasses = {
  default: "border-muted-foreground/20 border-t-foreground",
  primary: "border-primary/20 border-t-primary",
  accent: "border-accent/20 border-t-accent",
}

/**
 * Professional Loading Component
 *
 * A modern, customizable loading spinner with multiple sizes and variants.
 * Perfect for loading states, data fetching, and async operations.
 *
 * @example
 * ```tsx
 * <Loading />
 * <Loading size="lg" text="Loading data..." />
 * <Loading variant="primary" fullscreen />
 * ```
 */
const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({
    className,
    size = "md",
    text,
    variant = "default",
    fullscreen = false,
    ...props
  }, ref) => {
    const spinnerContent = (
      <div className={cn("flex flex-col items-center justify-center gap-3", className)} ref={ref} {...props}>
        <div
          className={cn(
            "animate-spin rounded-full",
            sizeClasses[size],
            variantClasses[variant]
          )}
          role="status"
          aria-label="Loading"
        />
        {text && (
          <p
            className={cn(
              "text-muted-foreground font-medium animate-pulse",
              textSizeClasses[size]
            )}
          >
            {text}
          </p>
        )}
      </div>
    )

    if (fullscreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          {spinnerContent}
        </div>
      )
    }

    return spinnerContent
  }
)

Loading.displayName = "Loading"

/**
 * Skeleton Loading Component
 *
 * A shimmer skeleton loader for content placeholders.
 * Great for creating loading states that match your content structure.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-[250px]" />
 * <Skeleton className="h-12 w-12 rounded-full" />
 * ```
 */
const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md bg-muted shimmer",
      className
    )}
    {...props}
  />
))

Skeleton.displayName = "Skeleton"

/**
 * Dots Loading Component
 *
 * A minimal three-dot loading animation.
 * Perfect for inline loading states and subtle indicators.
 *
 * @example
 * ```tsx
 * <DotsLoading />
 * <DotsLoading size="lg" variant="primary" />
 * ```
 */
const DotsLoading = React.forwardRef<
  HTMLDivElement,
  Omit<LoadingProps, "text" | "fullscreen">
>(({ className, size = "md", variant = "default", ...props }, ref) => {
  const dotSizeClasses = {
    sm: "h-1 w-1",
    md: "h-2 w-2",
    lg: "h-3 w-3",
    xl: "h-4 w-4",
  }

  const dotColorClasses = {
    default: "bg-muted-foreground",
    primary: "bg-primary",
    accent: "bg-accent",
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    >
      <div
        className={cn(
          "rounded-full animate-bounce",
          dotSizeClasses[size],
          dotColorClasses[variant]
        )}
        style={{ animationDelay: "0ms" }}
      />
      <div
        className={cn(
          "rounded-full animate-bounce",
          dotSizeClasses[size],
          dotColorClasses[variant]
        )}
        style={{ animationDelay: "150ms" }}
      />
      <div
        className={cn(
          "rounded-full animate-bounce",
          dotSizeClasses[size],
          dotColorClasses[variant]
        )}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  )
})

DotsLoading.displayName = "DotsLoading"

/**
 * Pulse Loading Component
 *
 * A pulsing circle animation for subtle loading states.
 * Great for notifications and background processes.
 *
 * @example
 * ```tsx
 * <PulseLoading />
 * <PulseLoading size="lg" variant="accent" />
 * ```
 */
const PulseLoading = React.forwardRef<
  HTMLDivElement,
  Omit<LoadingProps, "text" | "fullscreen">
>(({ className, size = "md", variant = "default", ...props }, ref) => {
  const pulseColorClasses = {
    default: "bg-muted-foreground",
    primary: "bg-primary",
    accent: "bg-accent",
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <div
        className={cn(
          "rounded-full animate-pulse",
          sizeClasses[size].split(" ").slice(0, 2).join(" "),
          pulseColorClasses[variant]
        )}
        role="status"
        aria-label="Loading"
      />
    </div>
  )
})

PulseLoading.displayName = "PulseLoading"

export { Loading, Skeleton, DotsLoading, PulseLoading }
