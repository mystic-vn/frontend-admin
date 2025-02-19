import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "./badge";
import { Command, CommandGroup, CommandItem } from "./command";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  creatable?: boolean;
}

export function MultiSelect({
  values = [],
  onChange,
  placeholder = "Chọn...",
  creatable = false,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const safeValues = Array.isArray(values) ? values : [];

  const handleUnselect = (item: string) => {
    onChange(safeValues.filter((i) => i !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "" && safeValues.length > 0) {
          const newValues = [...safeValues];
          newValues.pop();
          onChange(newValues);
        }
      }
      // Add new item on Enter
      if (e.key === "Enter" && input.value !== "" && creatable) {
        e.preventDefault();
        if (!safeValues.includes(input.value)) {
          onChange([...safeValues, input.value]);
          setInputValue("");
        }
      }
      // Close on Escape
      if (e.key === "Escape") {
        input.blur();
      }
    }
  };

  return (
    <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
      <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex gap-1 flex-wrap">
          {safeValues.map((item) => {
            return (
              <Badge key={item} variant="secondary">
                {item}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(item);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(item)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
            placeholder={placeholder}
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && inputValue.length > 0 && creatable && (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="p-1">
              <CommandItem
                onSelect={() => {
                  onChange([...safeValues, inputValue]);
                  setInputValue("");
                }}
              >
                Thêm "{inputValue}"
              </CommandItem>
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  );
} 