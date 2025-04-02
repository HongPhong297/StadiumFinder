"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, X, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface MultiSelectOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
  placeholder?: string;
}

function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = "Select options",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:text-white", className)}
          onClick={() => setOpen(!open)}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length > 0 ? (
              selected.map((item) => {
                const option = options.find((opt) => opt.value === item);
                return (
                  <Badge
                    variant="secondary"
                    key={item}
                    className="mr-1 mb-1 bg-blue-600 text-white hover:bg-blue-500"
                    onClick={() => handleUnselect(item)}
                  >
                    {option?.label || item}
                    <X className="ml-1 h-4 w-4 cursor-pointer" />
                  </Badge>
                );
              })
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600">
        <Command className="bg-gray-800 text-white">
          <CommandInput placeholder="Search ..." className="placeholder:text-gray-400 text-white border-gray-600 focus:border-blue-500" />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup heading="Available options">
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        handleUnselect(option.value);
                      } else {
                        onChange([...selected, option.value]);
                      }
                      setOpen(true);
                    }}
                    className="text-white hover:!bg-gray-700 aria-selected:!bg-blue-700"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2">
                      {option.icon && <option.icon className="h-4 w-4" />}
                      <span>{option.label}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { MultiSelect }; 