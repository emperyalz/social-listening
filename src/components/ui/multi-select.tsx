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
              style={logoOnly ? { height: '50px', width: 'auto', maxWidth: '220px', objectFit: 'contain' } : { height: '16px', width: '16px', objectFit: 'contain' }}
            />
          ) : option.emoji ? (
            <span style={logoOnly ? { fontSize: '48px' } : { fontSize: '14px' }}>{option.emoji}</span>
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
          className="justify-between bg-white"
          style={logoOnly ? { minWidth: '280px', height: '80px', padding: '12px 16px' } : { minWidth: '180px' }}
        >
          <span className="truncate">{getDisplayContent()}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearIndividual}
            className="text-muted-foreground hover:text-foreground"
            style={logoOnly ? { height: '80px', width: '48px' } : { height: '40px', width: '40px' }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown - SOLID WHITE BACKGROUND */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 rounded-md border border-gray-200 bg-white shadow-lg"
          style={logoOnly ? { minWidth: '320px' } : { width: '100%', minWidth: '240px' }}
        >
          <div className="overflow-y-auto bg-white" style={{ maxHeight: '600px', padding: '12px' }}>
            {/* Clear Selection Option */}
            {selected.length > 0 && (
              <>
                <button
                  onClick={clearSelection}
                  className="w-full flex items-center gap-2 rounded-sm px-3 py-2 text-sm bg-white hover:bg-gray-100 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                  Clear selection ({selected.length})
                </button>
                <div style={{ margin: '8px 0', borderTop: '1px solid #e5e7eb' }} />
              </>
            )}

            {/* Options - MASSIVE LOGOS */}
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className="w-full flex items-center rounded-sm bg-white hover:bg-gray-100"
                  style={logoOnly ? { padding: '20px 16px', gap: '16px' } : { padding: '6px 8px', gap: '8px', fontSize: '14px' }}
                >
                  <div
                    className="flex items-center justify-center rounded border shrink-0"
                    style={{
                      width: logoOnly ? '28px' : '16px',
                      height: logoOnly ? '28px' : '16px',
                      ...(isSelected ? { borderColor: 'hsl(var(--primary))', backgroundColor: 'hsl(var(--primary))', color: 'white' } : { borderColor: '#d1d5db', backgroundColor: 'white' })
                    }}
                  >
                    {isSelected && <Check style={{ width: logoOnly ? '20px' : '12px', height: logoOnly ? '20px' : '12px' }} />}
                  </div>
                  {option.icon ? (
                    <img
                      src={option.icon}
                      alt={option.label}
                      style={logoOnly ? { height: '55px', width: 'auto', maxWidth: '240px', objectFit: 'contain' } : { height: '20px', width: '20px', objectFit: 'contain' }}
                    />
                  ) : option.emoji ? (
                    <span style={{ fontSize: logoOnly ? '55px' : '16px' }}>{option.emoji}</span>
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
