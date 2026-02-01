import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PagedListCardProps {
  pageTitle?: string;
  pageAction?: ReactNode;
  title?: string;
  filter: string;
  onFilterChange: (value: string) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  isError?: boolean;
  loadingText?: string;
  errorText?: string;
  emptyText?: string;
  itemsLength: number;
  total: number;
  page: number;
  size: number;
  onPageChange: (page: number) => void;
  showPagination?: boolean;
  children: ReactNode;
}

export function PagedListCard({
  pageTitle,
  pageAction,
  title = "Search",
  filter,
  onFilterChange,
  searchPlaceholder = "filtr…",
  isLoading,
  isError,
  loadingText = "Loading…",
  errorText = "Error loading data.",
  emptyText = "No results found",
  itemsLength,
  total,
  page,
  size,
  onPageChange,
  showPagination = true,
  children,
}: PagedListCardProps) {
  return (
    <>
      {(pageTitle || pageAction) && (
        <div className="flex items-center justify-between gap-4">
          {pageTitle ? (
            <h1 className="text-xl font-semibold">{pageTitle}</h1>
          ) : (
            <div />
          )}
          {pageAction}
        </div>
      )}

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <Input
            placeholder={searchPlaceholder}
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
          />
        </CardHeader>

        <CardContent className="space-y-2">
          {isLoading && <div className="text-sm">{loadingText}</div>}
          {isError && <div className="text-sm text-red-600">{errorText}</div>}

          {children}

          {!isLoading && !isError && itemsLength === 0 && (
            <div className="text-sm text-muted-foreground">{emptyText}</div>
          )}

          {showPagination && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">Total: {total}</div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={page === 0}
                  onClick={() => onPageChange(Math.max(0, page - 1))}
                >
                  Prev
                </Button>
                <div className="text-sm">Page {page + 1}</div>
                <Button
                  size="sm"
                  disabled={(page + 1) * size >= total}
                  onClick={() => onPageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
