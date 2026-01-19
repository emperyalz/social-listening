"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "./button";

interface MultiSelectOption {
  value: string;
  label: string;
  icon?: string; // URL for logo image
  emoji?: string; // Fallback emoji
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  logoOnly?: boolean; // When true, show only logos without text labels
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

  // Close dropdown when clicking outside
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
              className={logoOnly ? "h-12 w-auto max-w-[240px] object-contain" : "h-4 w-4 object-contain"}
            />
          ) : option.emoji ? (
            <span className={logoOnly ? "text-4xl" : "text-sm"}>{option.emoji}</span>
          ) : null}
          {!logoOnly && option.label}
        </span>
      );
    }
    return <span>{selected.length} selected</span>;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className={`justify-between bg-white ${logoOnly ? "min-w-[280px] h-16 py-2" : "min-w-[180px]"}`}
        >
          <span className="truncate">{getDisplayContent()}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearIndividual}
            className={`text-muted-foreground hover:text-foreground ${logoOnly ? "h-16 w-16" : "h-10 w-10"}`}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown - SOLID WHITE BACKGROUND */}
      {isOpen && (
        <div className={`absolute z-50 mt-2 rounded-md border border-gray-200 bg-white shadow-lg ${logoOnly ? "min-w-[320px]" : "w-full min-w-[240px]"}`}>
          <div className="max-h-[400px] overflow-y-auto p-2 bg-white">
            {/* Clear Selection Option */}
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

            {/* Options */}
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className={`w-full flex items-center gap-3 rounded-sm bg-white hover:bg-gray-100 ${logoOnly ? "px-3 py-3" : "px-2 py-1.5 text-sm"}`}
                >
                  <div
                    className={`flex items-center justify-center rounded border shrink-0 ${logoOnly ? "h-5 w-5" : "h-4 w-4"} ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className={logoOnly ? "h-4 w-4" : "h-3 w-3"} />}
                  </div>
                  {option.icon ? (
                    <img
                      src={option.icon}
                      alt={option.label}
                      className={logoOnly ? "h-14 w-auto max-w-[260px] object-contain" : "h-5 w-5 object-contain"}
                    />
                  ) : option.emoji ? (
                    <span className={logoOnly ? "text-5xl" : "text-base"}>{option.emoji}</span>
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
