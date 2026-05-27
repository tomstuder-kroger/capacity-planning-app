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
        style={{
          width: '100%',
          minHeight: '60px',
          padding: '8px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontFamily: 'inherit',
          fontSize: '14px'
        }}
      >
        {SUPPORT_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {value.length > 0 && (
        <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
          Selected: {value.join(', ')}
        </div>
      )}
    </div>
  );
};

export default SupportNeedsSelector;
