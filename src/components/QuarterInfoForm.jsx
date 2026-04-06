import React from 'react';
import { KdsInput, KdsLabel, KdsMessage } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';
import { validateQuarterName, validateWeeksInQuarter } from '../utils/validation';

const QuarterInfoForm = () => {
  const { activeIC, updateIC } = useCapacity();

  if (!activeIC) return null;

  const handleQuarterChange = (e) => {
    updateIC(activeIC.id, { quarter: e.target.value });
  };

  const handleWeeksChange = (e) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    updateIC(activeIC.id, { weeksInQuarter: value });
  };

  const quarterError = validateQuarterName(activeIC.quarter);
  const weeksError = validateWeeksInQuarter(activeIC.weeksInQuarter);

  return (
    <div className="kds-Card kds-Card--m kds-card-section">
      <h2 className="kds-Heading kds-Heading--s section-heading">Quarter Information</h2>
      <div className="form-grid-2col">
        <div>
          <KdsLabel>
            Quarter
            <KdsInput
              type="text"
              placeholder="e.g., Q1 2024"
              value={activeIC.quarter}
              onChange={handleQuarterChange}
              invalid={!!quarterError}
            />
          </KdsLabel>
          {quarterError && <KdsMessage kind="error">{quarterError}</KdsMessage>}
        </div>
        <div>
          <KdsLabel>
            Weeks in Quarter
            <KdsInput
              type="number"
              placeholder="e.g., 13"
              value={activeIC.weeksInQuarter}
              onChange={handleWeeksChange}
              invalid={!!weeksError}
              min={0}
              step={0.1}
            />
          </KdsLabel>
          {weeksError && <KdsMessage kind="error">{weeksError}</KdsMessage>}
        </div>
      </div>
    </div>
  );
};

export default QuarterInfoForm;
