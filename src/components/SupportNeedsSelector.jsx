import React, { useState, useRef, useEffect } from 'react';
import { KdsCheckbox, KdsLabel } from 'react-mx-web-components';

const SUPPORT_OPTIONS = [
  'User Research',
  'Service Designer'
];

const SupportNeedsSelector = ({ value = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
    <div className="project-field" ref={dropdownRef}>
      <label className="kds-Label kds-Text--m" style={{ fontWeight: 700 }}>
        Support Needed
      </label>
      <div className="support-dropdown">
        <button
          type="button"
          className="support-dropdown-button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{displayText}</span>
          <span className="support-dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
        </button>
        {isOpen && (
          <div className="support-dropdown-menu">
            {SUPPORT_OPTIONS.map(option => (
              <KdsLabel key={option} className="support-dropdown-option">
                <KdsCheckbox
                  checked={value.includes(option)}
                  onChange={() => handleToggle(option)}
                  compact
                />
                {option}
              </KdsLabel>
            ))}
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div className="support-needs-selected">
          Selected: {value.join(', ')}
        </div>
      )}
    </div>
  );
};

export default SupportNeedsSelector;
