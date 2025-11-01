import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icon to display (React component or JSX element)
   */
  icon?: React.ReactNode
  /**
   * Title of the empty state
   */
  title: string
  /**
   * Description or subtitle
   */
  description?: string
  /**
   * Action button configuration
   */
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  }
  /**
   * Secondary action button configuration
   */
  secondaryAction?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  }
  /**
   * Size variant of the empty state
   * @default "default"
   */
  size?: "sm" | "default" | "lg"
}

const sizeClasses = {
  sm: {
    container: "py-8",
    icon: "h-12 w-12 mb-3",
    title: "text-lg",
    description: "text-sm",
  },
  default: {
    container: "py-12",
    icon: "h-16 w-16 mb-4",
    title: "text-xl",
    description: "text-base",
  },
  lg: {
    container: "py-16",
    icon: "h-20 w-20 mb-6",
    title: "text-2xl",
    description: "text-lg",
  },
}

/**
 * Professional Empty State Component
 *
 * A beautiful empty state component for displaying when no data is available.
 * Perfect for empty lists, search results, or initial states.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<FileIcon />}
 *   title="No files found"
 *   description="Upload your first file to get started"
 *   action={{
 *     label: "Upload File",
 *     onClick: () => console.log("Upload clicked")
 *   }}
 * />
 * ```
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({
    className,
    icon,
    title,
    description,
    action,
    secondaryAction,
    size = "default",
    ...props
  }, ref) => {
    const classes = sizeClasses[size]

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center animate-fade-in",
          classes.container,
          className
        )}
        {...props}
      >
        {icon && (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground mb-4 transition-smooth hover:bg-muted",
              classes.icon
            )}
          >
            {icon}
          </div>
        )}

        <div className="space-y-2 max-w-md">
          <h3 className={cn("font-semibold text-foreground", classes.title)}>
            {title}
          </h3>

          {description && (
            <p className={cn("text-muted-foreground", classes.description)}>
              {description}
            </p>
          )}
        </div>

        {(action || secondaryAction) && (
          <div className="flex items-center gap-3 mt-6">
            {action && (
              <Button
                onClick={action.onClick}
                variant={action.variant || "default"}
                className="transition-smooth"
              >
                {action.label}
              </Button>
            )}

            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || "outline"}
                className="transition-smooth"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }
)

EmptyState.displayName = "EmptyState"

/**
 * Icon Presets for Common Empty States
 */
export const EmptyStateIcons = {
  /**
   * Generic file/document icon
   */
  File: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  ),

  /**
   * Search icon
   */
  Search: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  ),

  /**
   * Inbox/empty icon
   */
  Inbox: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z"
      />
    </svg>
  ),

  /**
   * Users/people icon
   */
  Users: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  ),

  /**
   * Calendar/event icon
   */
  Calendar: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  ),

  /**
   * Book/education icon
   */
  Book: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  ),

  /**
   * Folder icon
   */
  Folder: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
      />
    </svg>
  ),

  /**
   * Bell/notification icon
   */
  Bell: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  ),

  /**
   * Plus/add icon
   */
  Plus: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  ),

  /**
   * Chart/analytics icon
   */
  Chart: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  ),
}

export { EmptyState }
