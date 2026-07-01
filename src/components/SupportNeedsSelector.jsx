import React, { useState, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const SUPPORT_OPTIONS = ['User Research', 'Service Designer'];

const SupportNeedsSelector = ({ value = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = (option) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  const displayText = value.length === 0
    ? 'Select support needed'
    : `${value.length} item${value.length !== 1 ? 's' : ''} selected`;

  return (
    <div className="flex-1 min-w-[130px] relative" ref={dropdownRef}>
      <label className="text-xs font-semibold block mb-1">Support Needed</label>
      <div className="relative">
        <button
          type="button"
          className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-xs/relaxed text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-ring/30"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{displayText}</span>
          <span className="ml-1 text-muted-foreground">{isOpen ? '▲' : '▼'}</span>
        </button>
        {isOpen && (
          <div className="absolute z-50 top-full left-0 mt-1 w-full bg-popover border border-border rounded-md shadow-md p-1">
            {SUPPORT_OPTIONS.map(option => (
              <div key={option} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer">
                <Checkbox
                  id={`support-${option}`}
                  checked={value.includes(option)}
                  onCheckedChange={() => handleToggle(option)}
                />
                <Label htmlFor={`support-${option}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div className="mt-1 text-xs text-muted-foreground">Selected: {value.join(', ')}</div>
      )}
    </div>
  );
};

export default SupportNeedsSelector;
