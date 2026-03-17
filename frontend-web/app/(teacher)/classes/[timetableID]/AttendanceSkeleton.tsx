import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';

export default function AttendanceSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between animate-pulse">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <Badge className="h-5 w-10 bg-gray-200 rounded">&nbsp;</Badge>
        </CardTitle>
        <CardDescription>
          <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-100 border border-gray-200 rounded-lg animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-300" />
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-gray-300 rounded" />
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-5 w-5 bg-gray-300 rounded-full" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}