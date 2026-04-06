import React from 'react';
import { KdsInput, KdsLabel, KdsMessage } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';
import { validateICName, validateICRole } from '../utils/validation';

const ICInfoForm = () => {
  const { activeIC, updateIC } = useCapacity();

  if (!activeIC) return null;

  const handleNameChange = (e) => {
    updateIC(activeIC.id, { icName: e.target.value });
  };

  const handleRoleChange = (e) => {
    updateIC(activeIC.id, { icRole: e.target.value });
  };

  const nameError = validateICName(activeIC.icName);
  const roleError = validateICRole(activeIC.icRole);

  return (
    <div className="kds-Card kds-Card--m kds-card-section">
      <h2 className="kds-Heading kds-Heading--s section-heading">IC Information</h2>
      <div className="form-grid-2col">
        <div>
          <KdsLabel>
            IC Name
            <KdsInput
              type="text"
              placeholder="e.g., Joe Test"
              value={activeIC.icName}
              onChange={handleNameChange}
              invalid={!!nameError}
            />
          </KdsLabel>
          {nameError && <KdsMessage kind="error">{nameError}</KdsMessage>}
        </div>
        <div>
          <KdsLabel>
            IC Role
            <KdsInput
              type="text"
              placeholder="e.g., PD"
              value={activeIC.icRole}
              onChange={handleRoleChange}
              invalid={!!roleError}
            />
          </KdsLabel>
          {roleError && <KdsMessage kind="error">{roleError}</KdsMessage>}
        </div>
      </div>
    </div>
  );
};

export default ICInfoForm;
