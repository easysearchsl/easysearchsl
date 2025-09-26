import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { CategoryNode } from "@/data/categories";

export interface CategoryMultiSelectProps {
  tree: CategoryNode[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxSelected?: number; // optional limit
}

export function CategoryMultiSelect({ tree, value, onChange, placeholder = "Select categories", maxSelected = Infinity }: CategoryMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [limitHit, setLimitHit] = React.useState(false);

  const toggle = (val: string) => {
    if (value.includes(val)) onChange(value.filter(v => v !== val));
    else {
      if (value.length >= maxSelected) {
        // show a brief visual hint; also a persistent inline message is rendered below
        setLimitHit(true);
        window.setTimeout(() => setLimitHit(false), 1500);
        return;
      }
      onChange([...value, val]);
    }
  };

  const clearAll = () => onChange([]);

  const selectedCount = value.length;
  const atLimit = selectedCount >= maxSelected;

  const canSelect = (val: string) => atLimit ? value.includes(val) : true;

  const renderTriggerLabel = () => {
    if (selectedCount === 0) return placeholder;
    if (selectedCount === 1) return "1 category selected";
    return `${selectedCount} categories selected`;
  };

  const valueToLabel = (val: string): string => {
    for (const t of tree) {
      if (t.value === val) return t.label;
      for (const c of t.children ?? []) {
        if (c.value === val) return `${t.label} / ${c.label}`;
      }
    }
    return val;
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate text-left">{renderTriggerLabel()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <div className="p-2">
              <CommandInput placeholder="Search categories..." />
            </div>
            <CommandList>
              <CommandEmpty>No category found.</CommandEmpty>
              {tree.map((top) => (
                <React.Fragment key={top.value}>
                  <CommandGroup heading={top.label}>
                    {/* Allow selecting top-level node too */}
                    <CommandItem
                      key={`${top.value}__self`}
                      onSelect={() => canSelect(top.value) && toggle(top.value)}
                      aria-disabled={!canSelect(top.value)}
                      className={cn(
                        "flex items-center justify-between",
                        !canSelect(top.value) && "opacity-50 pointer-events-none cursor-not-allowed"
                      )}
                    >
                      <span>{top.label}</span>
                      {value.includes(top.value) && <Check className="h-4 w-4" />}
                    </CommandItem>
                    {(top.children ?? []).map((child) => (
                      <CommandItem
                        key={child.value}
                        onSelect={() => canSelect(child.value) && toggle(child.value)}
                        aria-disabled={!canSelect(child.value)}
                        className={cn(
                          "flex items-center justify-between pl-6",
                          !canSelect(child.value) && "opacity-50 pointer-events-none cursor-not-allowed"
                        )}
                      >
                        <span>{child.label}</span>
                        {value.includes(child.value) && <Check className="h-4 w-4" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </React.Fragment>
              ))}
            </CommandList>
            {(atLimit || limitHit) && (
              <div className="px-3 py-2 text-xs text-red-600" aria-live="polite">
                Selection limit reached ({maxSelected}). Remove one to add another.
              </div>
            )}
            <div className="flex items-center justify-between gap-2 p-2 border-t bg-muted/30">
              <Button variant="ghost" size="sm" onClick={clearAll} disabled={value.length === 0}>
                <X className="mr-1 h-4 w-4" /> Clear
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>Done</Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Visible counter under trigger */}
      <div className="text-xs text-muted-foreground" aria-live="polite">
        {Number.isFinite(maxSelected) ? (
          <span>
            {selectedCount} of {maxSelected} selected
          </span>
        ) : (
          <span>{selectedCount} selected</span>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((v) => (
            <Badge key={v} variant="secondary" className="flex items-center gap-1">
              <span className="max-w-[180px] truncate">{valueToLabel(v)}</span>
              <button onClick={() => toggle(v)} aria-label={`Remove ${v}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryMultiSelect;
