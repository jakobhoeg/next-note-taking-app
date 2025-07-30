import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-secondary/40 dark:bg-secondary animate-pulse rounded-xl", className)}
      {...props}
    />
  )
}

export { Skeleton }
