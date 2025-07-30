import { Skeleton } from './ui/skeleton'

export default function NoteSkeleton() {
  return (
    <div className="flex-1 relative h-full space-y-4 ">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-8 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
