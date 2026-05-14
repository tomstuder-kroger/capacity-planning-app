import React from 'react';
import { KdsButton, KdsIconTrash, MxInputTextBox } from 'react-mx-web-components';

const DateField = ({ label, value, onChange }) => (
  <div className="project-field">
    <label className="kds-Label kds-Text--m" style={{ fontWeight: 700 }}>{label}</label>
    <input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="project-date-input"
    />
  </div>
);

const PTORow = ({ pto, onUpdate, onRemove }) => {

  return (
    <div className="project-item">
      <div className="project-item-header">
        <span className="project-item-label">PTO Instance</span>
        <KdsButton
          palette="negative"
          kind="subtle"
          variant="minimal"
          onClick={() => onRemove(pto.id)}
          aria-label="Remove PTO instance"
        >
          <KdsIconTrash size="s" />
        </KdsButton>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <MxInputTextBox
          label="Type (e.g., PTO, Summer vacation, Conference)"
          placeholder="PTO type"
          value={pto.type || ''}
          onChange={(e) => onUpdate(pto.id, { type: e.target.value })}
          mask="none"
          isClearable={false}
        />
      </div>

      <div className="project-item-fields">
        <DateField
          label="Start Date"
          value={pto.startDate}
          onChange={(iso) => onUpdate(pto.id, { startDate: iso })}
        />
        <DateField
          label="End Date"
          value={pto.endDate}
          onChange={(iso) => onUpdate(pto.id, { endDate: iso })}
        />
      </div>
    </div>
  );
};

export default PTORow;
