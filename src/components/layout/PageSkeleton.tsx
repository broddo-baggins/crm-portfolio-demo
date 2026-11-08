import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Stands in for a lazy route inside the app shell: stat cards and two charts, like the dashboard. */
export function PageSkeleton() {
  return (
    <div className="space-y-6" data-testid="page-skeleton" aria-busy="true">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-2 p-4 sm:p-6">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="h-3 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardContent className="p-4 sm:p-6">
            <Skeleton className="h-[250px] lg:h-[350px]" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardContent className="p-4 sm:p-6">
            <Skeleton className="h-[250px] lg:h-[350px]" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
