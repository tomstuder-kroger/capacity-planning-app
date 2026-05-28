import React from 'react';
import { MxMultiSelect } from 'react-mx-web-components';

const SUPPORT_OPTIONS = [
  'User Research',
  'Service Designer'
];

const SupportNeedsSelector = ({ value = [], onChange }) => {
  const handleValueUpdate = (event) => {
    // event.detail should contain the array of selected values
    const selectedValues = Array.isArray(event.detail) ? event.detail : [];
    onChange(selectedValues);
  };

  return (
    <div className="project-field">
      <MxMultiSelect
        label="Support Needed"
        items={SUPPORT_OPTIONS}
        selectedItems={value}
        emitOnlyValue
        onValueUpdate={handleValueUpdate}
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
