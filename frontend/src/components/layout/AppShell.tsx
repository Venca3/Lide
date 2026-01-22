import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Props = {
  title?: string;
  children: ReactNode;
};

export function AppShell({ title = "Lide", children }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="font-semibold">{title}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/persons">Persons</Link>
            </Button>
            <Button variant="outline" size="sm">
              <Link to="/tags">Tags</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
