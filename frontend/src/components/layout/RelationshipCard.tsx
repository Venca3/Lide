import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RelationshipCardProps {
  title: ReactNode;
  action?: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
  error?: ReactNode;
}

export function RelationshipCard({
  title,
  action,
  isEmpty,
  emptyMessage = "None",
  children,
  error,
}: RelationshipCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>

      <CardContent className="space-y-2">
        {isEmpty && <div className="text-sm text-muted-foreground">{emptyMessage}</div>}
        {!isEmpty && children}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </CardContent>
    </Card>
  );
}
