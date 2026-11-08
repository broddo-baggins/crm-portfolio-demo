import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CornerDownLeft, FolderOpen, Search, UserRound, CornerUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Kbd } from "@/components/system/Kbd";
import { getNavItems } from "@/utils/navigation";
import { NAV_SHORTCUTS } from "@/utils/navGroups";
import { searchMockData } from "@/services/mockSearchService";
import { useAuth } from "@/context/ClientAuthContext";
import { useAdminAccess } from "@/hooks/useAdminAccess";

interface Item {
  id: string;
  label: string;
  hint?: string;
  path: string;
  kind: "page" | "lead" | "project" | "other";
  shortcut?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const kindIcon = { page: CornerUpRight, lead: UserRound, project: FolderOpen, other: UserRound } as const;

/** Jump to a page, lead or project. Opened with Cmd/Ctrl K or "/". */
export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const { isSystemAdmin, isCompanyAdmin } = useAdminAccess();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const pages: Item[] = useMemo(
    () =>
      getNavItems(t, user, { isSystemAdmin, isCompanyAdmin }).map((n) => ({
        id: `page-${n.path}`,
        label: n.name,
        path: n.path,
        kind: "page" as const,
        shortcut: NAV_SHORTCUTS[n.path],
      })),
    [t, user, isSystemAdmin, isCompanyAdmin],
  );

  const items: Item[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return pages.slice(0, 8);
    const matchedPages = pages.filter((p) => p.label.toLowerCase().includes(q));
    const found = searchMockData(q, 8).map<Item>((r) => ({
      id: `${r.type}-${r.id}`,
      label: r.title,
      hint: r.subtitle,
      path: r.path,
      kind: r.type === "lead" ? "lead" : r.type === "project" ? "project" : "other",
    }));
    return [...matchedPages, ...found];
  }, [query, pages]);

  useEffect(() => setActive(0), [query, open]);
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>("[aria-selected='true']")?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (item?: Item) => {
    if (!item) return;
    onOpenChange(false);
    navigate(item.path);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(items[active]);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink-950/50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed start-1/2 top-[12vh] z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-[10px] border border-border bg-popover text-popover-foreground shadow-float focus:outline-none rtl:translate-x-1/2"
          aria-describedby={undefined}
          data-testid="command-palette"
        >
          <DialogPrimitive.Title className="sr-only">Search and jump to</DialogPrimitive.Title>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              autoFocus
              role="combobox"
              aria-expanded="true"
              aria-controls="command-list"
              aria-activedescendant={items[active] ? `cmd-${items[active].id}` : undefined}
              aria-label="Search pages, leads and projects"
              placeholder="Search pages, leads and projects"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              className="h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Kbd>Esc</Kbd>
          </div>
          <ul id="command-list" ref={listRef} role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto p-1.5">
            {items.length === 0 && (
              <li className="px-3 py-8 text-center text-sm text-muted-foreground" role="presentation">
                Nothing matches "{query}". Try a lead name or a page.
              </li>
            )}
            {items.map((item, i) => {
              const Icon = kindIcon[item.kind];
              return (
                <li
                  key={item.id}
                  id={`cmd-${item.id}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(item)}
                  className={cn(
                    "flex h-10 cursor-pointer items-center gap-3 rounded-md px-3 text-sm",
                    i === active ? "bg-accent text-foreground" : "text-secondary-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate font-medium">{item.label}</span>
                  {item.hint && <span className="truncate text-xs text-muted-foreground">{item.hint}</span>}
                  <span className="ms-auto flex shrink-0 items-center gap-1">
                    {item.shortcut && (
                      <>
                        <Kbd>G</Kbd>
                        <Kbd>{item.shortcut.toUpperCase()}</Kbd>
                      </>
                    )}
                    {i === active && !item.shortcut && <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-4 border-t border-border bg-surface-sunken px-4 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> move</span>
            <span className="flex items-center gap-1.5"><Kbd>↵</Kbd> open</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
