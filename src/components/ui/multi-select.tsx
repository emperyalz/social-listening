"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";

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
              className="h-4 w-4 object-contain"
            />
          ) : option.emoji ? (
            <span className="text-sm">{option.emoji}</span>
          ) : null}
          {!logoOnly && option.label}
        </span>
      );
    }
    return <span>{selected.length} selected</span>;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button - Green in both light and dark mode */}
      <div className="flex gap-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-2 px-4 py-2 min-w-[180px] rounded-lg bg-[#28A963] text-white font-medium text-sm hover:bg-[#229955] transition-colors"
        >
          <span className="truncate">{getDisplayContent()}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {selected.length > 0 && (
          <button
            onClick={clearIndividual}
            className="flex items-center justify-center h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown - White in light mode, dark in dark mode */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[240px] rounded-lg border border-border bg-white dark:bg-gray-900 dark:border-gray-700 shadow-xl">
          <div className="max-h-60 overflow-y-auto p-2">
            {/* Clear Selection Option */}
            {selected.length > 0 && (
              <>
                <button
                  onClick={clearSelection}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear selection ({selected.length})
                </button>
                <div className="my-2 border-t border-border dark:border-gray-700" />
              </>
            )}

            {/* Options */}
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground dark:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border shrink-0 ${
                      isSelected
                        ? "border-[#28A963] bg-[#28A963] text-white"
                        : "border-gray-300 dark:border-gray-500 bg-transparent"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  {option.icon ? (
                    <img
                      src={option.icon}
                      alt={option.label}
                      className="h-5 w-5 object-contain"
                    />
                  ) : option.emoji ? (
                    <span>{option.emoji}</span>
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
