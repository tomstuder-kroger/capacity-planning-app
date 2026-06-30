import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';

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
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onRemove(pto.id)}
          aria-label="Remove PTO instance"
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
        </Button>
      </div>

      <div style={{ marginBottom: '0.75rem' }} className="flex flex-col gap-1.5">
        <Label htmlFor={`pto-type-${pto.id}`}>Type (e.g., PTO, Summer vacation, Conference)</Label>
        <Input
          id={`pto-type-${pto.id}`}
          placeholder="PTO type"
          value={pto.type || ''}
          onChange={(e) => onUpdate(pto.id, { type: e.target.value })}
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
