import React from 'react';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { useCapacity } from '../context/CapacityContext';
import { calculateTotalPTO, formatWeeksAndDays } from '../utils/calculations';
import PTORow from './PTORow';
import EmptyState from './EmptyState';

const PTOScheduling = () => {
  const { activeIC, updateIC } = useCapacity();

  if (!activeIC) return null;

  const ptoInstances = activeIC.ptoInstances || [];

  const handleAddPTO = () => {
    const newPTO = { id: uuidv4(), type: '', startDate: null, endDate: null };
    updateIC(activeIC.id, { ptoInstances: [...ptoInstances, newPTO] });
  };

  const handlePTOUpdate = (ptoId, updates) => {
    const updatedInstances = ptoInstances.map(pto =>
      pto.id === ptoId ? { ...pto, ...updates } : pto
    );
    updateIC(activeIC.id, { ptoInstances: updatedInstances });
  };

  const handlePTORemove = (ptoId) => {
    const updatedInstances = ptoInstances.filter(pto => pto.id !== ptoId);
    updateIC(activeIC.id, { ptoInstances: updatedInstances });
  };

  const totalPTOWeeks = calculateTotalPTO(ptoInstances);

  return (
    <div className="mt-6 pt-6 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold">Scheduled PTO</h2>
        <span className="text-xs text-muted-foreground">{formatWeeksAndDays(totalPTOWeeks)} total</span>
      </div>

      <div className="flex flex-col gap-0">
        {ptoInstances.length === 0 ? (
          <EmptyState
            compact
            title="No PTO scheduled"
            subtitle='Click "+ Add PTO Instance" below to schedule time off'
          />
        ) : (
          ptoInstances.map(pto => (
            <PTORow
              key={pto.id}
              pto={pto}
              onUpdate={handlePTOUpdate}
              onRemove={handlePTORemove}
            />
          ))
        )}
      </div>

      <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleAddPTO}>
        + Add PTO Instance
      </Button>
    </div>
  );
};

export default PTOScheduling;
