import { Skeleton } from '@/components/ui/skeleton'

export default function ListSkeleton() {
  return (
    <main className="flex-1 px-4 overflow-y-auto w-full max-w-4xl mx-auto">
      <div className="space-y-3">
        <Skeleton className="h-20 w-full"></Skeleton>
        <Skeleton className="h-20 w-full"></Skeleton>
        <Skeleton className="h-20 w-full"></Skeleton>
        <Skeleton className="h-20 w-full"></Skeleton>
        <Skeleton className="h-20 w-full"></Skeleton>
      </div>
    </main>
  )
}
