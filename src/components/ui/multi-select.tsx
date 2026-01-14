"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, X, Check } from "lucide-react";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MultiSelect({ 
  options, 
  selected, 
  onChange, 
  placeholder, 
  icon,
  className = "w-[200px]"
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearThis = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const displayText = selected.length === 0 
    ? placeholder 
    : selected.length === 1 
      ? options.find(o => o.value === selected[0])?.label || selected[0]
      : `${selected.length} selected`;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-10 px-3 py-2 text-sm bg-white border rounded-md hover:bg-slate-50"
      >
        <span className="flex items-center gap-2 truncate">
          {icon}
          {displayText}
        </span>
        <div className="flex items-center gap-1">
          {selected.length > 0 && (
            <span title="Clear this filter">
              <X 
                className="h-4 w-4 text-slate-400 hover:text-red-500 cursor-pointer" 
                onClick={clearThis}
              />
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {selected.length > 0 && (
            <div
              onClick={clearThis}
              className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 cursor-pointer border-b text-red-600 text-sm"
            >
              <X className="h-4 w-4" />
              Clear selection ({selected.length})
            </div>
          )}
          {options.map(option => (
            <div
              key={option.value}
              onClick={() => toggleOption(option.value)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer"
            >
              <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                selected.includes(option.value) ? "bg-primary border-primary" : "border-slate-300"
              }`}>
                {selected.includes(option.value) && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper component to show "Clear All Filters" button when any filter is active
export function ClearAllFilters({ 
  onClear, 
  show 
}: { 
  onClear: () => void; 
  show: boolean;
}) {
  if (!show) return null;
  
  return (
    <button
      onClick={onClear}
      className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
    >
      <X className="h-4 w-4" />
      Clear All Filters
    </button>
  );
}
