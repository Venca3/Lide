import type { ReactNode } from "react";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UI_LABELS } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PagedListCard_newProps {
  resources: { singular: string, plural: string }
  pageAction?: ReactNode;
  addDialogContent?: ReactNode;
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

export function PagedListCard_new({
  resources,
  pageAction,
  addDialogContent,
  title = UI_LABELS.SEARCH,
  filter,
  onFilterChange,
  searchPlaceholder = `${UI_LABELS.SEARCH} ${resources.singular.toLowerCase()}…`,
  isLoading,
  isError,
  loadingText = UI_LABELS.LOADING,
  errorText = UI_LABELS.ERROR_LOADING_DATA,
  emptyText = UI_LABELS.NO_RESULTS_FOUND,
  itemsLength,
  total,
  page,
  size,
  onPageChange,
  showPagination = true,
  children,
}: PagedListCard_newProps) {
  const [addOpen, setAddOpen] = useState(false);
  const effectivePageAction = pageAction || (addDialogContent ? (
    <Dialog open={addOpen} onOpenChange={setAddOpen}>
      <DialogTrigger asChild>
        <Button>{`${UI_LABELS.NEW} ${resources.singular.toLowerCase()}`}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`${UI_LABELS.ADD_NEW} ${resources.singular}`}</DialogTitle>
          <DialogDescription>
            {`Add a new ${resources.singular.toLowerCase()} to your database.`}
          </DialogDescription>
        </DialogHeader>
        {addDialogContent}
      </DialogContent>
    </Dialog>
  ) : undefined);

  return (
    <>
      {effectivePageAction && (
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">{resources.plural}</h1>
          {effectivePageAction}
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
              <div className="text-sm text-muted-foreground">{UI_LABELS.TOTAL}: {total}</div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={page === 0}
                  onClick={() => onPageChange(Math.max(0, page - 1))}
                >
                  {UI_LABELS.PREVIOUS}
                </Button>
                <div className="text-sm">{UI_LABELS.PAGE} {page + 1}</div>
                <Button
                  size="sm"
                  disabled={(page + 1) * size >= total}
                  onClick={() => onPageChange(page + 1)}
                >
                  {UI_LABELS.NEXT}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
