import React from 'react';

const SUPPORT_OPTIONS = [
  { value: 'User Research', label: 'User Research' },
  { value: 'Service Designer', label: 'Service Designer' }
];

const SupportNeedsSelector = ({ value = [], onChange }) => {
  const handleChange = (event) => {
    const options = event.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    onChange(selected);
  };

  return (
    <div className="project-field">
      <label className="kds-Label kds-Text--m" style={{ fontWeight: 700 }}>
        Support Needed
      </label>
      <select
        multiple
        value={value}
        onChange={handleChange}
        className="support-needs-select"
        aria-label="Support needed"
      >
        {SUPPORT_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {value.length > 0 && (
        <div className="support-needs-selected">
          Selected: {value.join(', ')}
        </div>
      )}
    </div>
  );
};

export default SupportNeedsSelector;
