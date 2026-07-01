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
    <div className="mt-6">
      <h2 className="mb-4 text-base font-bold">Scheduled PTO</h2>

      <div className="mb-4 p-6 bg-card rounded-lg border">
        <div className="flex flex-col gap-0">
          {ptoInstances.length === 0 ? (
            <EmptyState
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

        <div className="mt-4 p-3 bg-muted rounded-md">
          <div className="flex justify-between items-center">
            <span>PTO total: {formatWeeksAndDays(totalPTOWeeks)}</span>
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full mt-2" onClick={handleAddPTO}>
        + Add PTO Instance
      </Button>
    </div>
  );
};

export default PTOScheduling;
