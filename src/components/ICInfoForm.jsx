import React from 'react';
import { MxInputTextBox, MxSingleSelect } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';

const ICInfoForm = () => {
  const { activeIC, updateIC } = useCapacity();

  if (!activeIC) return null;

  const handleNameChange = (e) => {
    updateIC(activeIC.id, { icName: e.target.value });
  };

  const handleRoleChange = (e) => {
    updateIC(activeIC.id, { icRole: e.detail });
  };

  return (
    <div className="kds-Card kds-Card--m kds-card-section">
      <h2 className="kds-Heading kds-Heading--s section-heading">IC Information</h2>
      <div className="form-grid-2col">
        <div>
          <MxInputTextBox
            label="IC Name"
            placeholder="e.g., Joe Test"
            value={activeIC.icName}
            onChange={handleNameChange}
            mask="none"
            isClearable={false}
          />
        </div>
        <div>
          <MxSingleSelect
            label="IC Role"
            items={['APD', 'PD', 'SPD']}
            value={activeIC.icRole}
            emitOnlyValue
            onValueUpdate={handleRoleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ICInfoForm;
