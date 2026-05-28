import React from 'react';
import { MxMultiSelect } from 'react-mx-web-components';

const SUPPORT_OPTIONS = [
  { value: 'User Research', label: 'User Research', selected: false },
  { value: 'Service Designer', label: 'Service Designer', selected: false }
];

const SupportNeedsSelector = ({ value = [], onChange }) => {
  const handleSelectionChanged = (event) => {
    const selectedValues = event.detail.map(item => item.value);
    onChange(selectedValues);
  };

  // Map current values to items with selected state
  const items = SUPPORT_OPTIONS.map(option => ({
    ...option,
    selected: value.includes(option.value)
  }));

  return (
    <div className="project-field">
      <MxMultiSelect
        label="Support Needed"
        items={items}
        selectedItems={value}
        onSelectionChanged={handleSelectionChanged}
      />
      {value.length > 0 && (
        <div className="support-needs-selected">
          Selected: {value.join(', ')}
        </div>
      )}
    </div>
  );
};

export default SupportNeedsSelector;
