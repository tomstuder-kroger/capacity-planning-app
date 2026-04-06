import React from 'react';
import { MxInputTextBox, MxSingleSelect } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';

const QUARTER_ITEMS = ['Q1', 'Q2', 'Q3', 'Q4'];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_ITEMS = Array.from({ length: 2036 - CURRENT_YEAR + 1 }, (_, i) => String(CURRENT_YEAR + i));

const parseQuarter = (quarter) => {
  const [q = '', y = ''] = (quarter || '').split(' ');
  return { q, y };
};

const QuarterInfoForm = () => {
  const { activeIC, updateIC } = useCapacity();

  if (!activeIC) return null;

  const { q: selectedQ, y: selectedYear } = parseQuarter(activeIC.quarter);

  const handleQChange = (e) => {
    updateIC(activeIC.id, { quarter: `${e.detail} ${selectedYear}`.trim() });
  };

  const handleYearChange = (e) => {
    updateIC(activeIC.id, { quarter: `${selectedQ} ${e.detail}`.trim() });
  };

  const handleWeeksChange = (e) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    updateIC(activeIC.id, { weeksInQuarter: value });
  };

  return (
    <div className="kds-Card kds-Card--m kds-card-section">
      <h2 className="kds-Heading kds-Heading--s section-heading">Quarter Information</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <div>
          <MxSingleSelect
            label="Quarter"
            items={QUARTER_ITEMS}
            value={selectedQ}
            emitOnlyValue
            onValueUpdate={handleQChange}
          />
        </div>
        <div>
          <MxSingleSelect
            label="Year"
            items={YEAR_ITEMS}
            value={selectedYear}
            emitOnlyValue
            onValueUpdate={handleYearChange}
          />
        </div>
        <div>
          <MxInputTextBox
            label="Weeks in Quarter"
            placeholder="e.g., 13"
            value={String(activeIC.weeksInQuarter)}
            onChange={handleWeeksChange}
            mask="none"
            isClearable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default QuarterInfoForm;
