import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';

const DateField = ({ label, value, onChange, id }) => (
  <div className="flex-1 min-w-[130px]">
    <label htmlFor={id} className="text-xs font-semibold block mb-1">{label}</label>
    <input
      id={id}
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-xs/relaxed focus:outline-none focus:ring-2 focus:ring-ring/30"
    />
  </div>
);

const PTORow = ({ pto, onUpdate, onRemove }) => {
  return (
    <div className="bg-muted/30 border border-border rounded-md p-3 mb-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PTO Instance</span>
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

      <div className="flex flex-col gap-1.5 mb-3">
        <Label htmlFor={`pto-type-${pto.id}`}>Type (e.g., PTO, Summer vacation, Conference)</Label>
        <Input
          id={`pto-type-${pto.id}`}
          placeholder="PTO type"
          value={pto.type || ''}
          onChange={(e) => onUpdate(pto.id, { type: e.target.value })}
        />
      </div>

      <div className="flex gap-3 items-start flex-wrap">
        <DateField
          label="Start Date"
          value={pto.startDate}
          onChange={(iso) => onUpdate(pto.id, { startDate: iso })}
          id={`pto-start-${pto.id}`}
        />
        <DateField
          label="End Date"
          value={pto.endDate}
          onChange={(iso) => onUpdate(pto.id, { endDate: iso })}
          id={`pto-end-${pto.id}`}
        />
      </div>
    </div>
  );
};

export default PTORow;
