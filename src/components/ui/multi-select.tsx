"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "./button";

interface MultiSelectOption {
  value: string;
  label: string;
  icon?: string;
  emoji?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  logoOnly?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  logoOnly = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearSelection = () => {
    onChange([]);
    setIsOpen(false);
  };

  const clearIndividual = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSelection();
  };

  const getDisplayContent = () => {
    if (selected.length === 0) return <span>{placeholder}</span>;
    if (selected.length === 1) {
      const option = options.find((opt) => opt.value === selected[0]);
      if (!option) return <span>{placeholder}</span>;
      return (
        <span className="flex items-center gap-2">
          {option.icon ? (
            <img
              src={option.icon}
              alt={option.label}
              className={logoOnly ? "h-8 w-auto max-w-[180px] object-contain" : "h-4 w-4 object-contain"}
            />
          ) : option.emoji ? (
            <span className={logoOnly ? "text-2xl" : "text-sm"}>{option.emoji}</span>
          ) : null}
          {!logoOnly && option.label}
        </span>
      );
    }
    return <span>{selected.length} selected</span>;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex gap-1">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="justify-between min-w-[180px] bg-white"
        >
          <span className="truncate">{getDisplayContent()}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearIndividual}
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[240px] rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="max-h-[300px] overflow-y-auto p-1 bg-white">
            {selected.length > 0 && (
              <>
                <button
                  onClick={clearSelection}
                  className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm bg-white hover:bg-gray-100 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                  Clear selection ({selected.length})
                </button>
                <div className="my-1 border-t border-gray-200" />
              </>
            )}

            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm bg-white hover:bg-gray-100"
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  {option.icon ? (
                    <img
                      src={option.icon}
                      alt={option.label}
                      className={logoOnly ? "h-10 w-auto max-w-[200px] object-contain" : "h-5 w-5 object-contain"}
                    />
                  ) : option.emoji ? (
                    <span className={logoOnly ? "text-3xl" : "text-base"}>{option.emoji}</span>
                  ) : null}
                  {!logoOnly && <span>{option.label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
