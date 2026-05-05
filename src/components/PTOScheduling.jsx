import React from 'react';
import { KdsButton } from 'react-mx-web-components';
import { v4 as uuidv4 } from 'uuid';
import { useCapacity } from '../context/CapacityContext';
import { calculateTotalPTO } from '../utils/calculations';
import PTORow from './PTORow';

const PTOScheduling = () => {
  const { activeIC, updateIC } = useCapacity();

  if (!activeIC) return null;

  const ptoInstances = activeIC.ptoInstances || [];

  const handleAddPTO = () => {
    const newPTO = {
      id: uuidv4(),
      type: '',
      startDate: null,
      endDate: null
    };
    updateIC(activeIC.id, {
      ptoInstances: [...ptoInstances, newPTO]
    });
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
    <div>
      <h2 className="kds-Heading kds-Heading--s section-heading">Scheduled PTO</h2>

      <div className="kds-Card kds-Card--m kds-card-section">
        <div className="project-list">
          {ptoInstances.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
              No PTO instances scheduled
            </div>
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

        <div className="summary-box">
          <div className="domain-header">
            <span>PTO total: {totalPTOWeeks.toFixed(1)} weeks</span>
          </div>
        </div>
      </div>

      <KdsButton kind="secondary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handleAddPTO}>
        + Add PTO Instance
      </KdsButton>
    </div>
  );
};

export default PTOScheduling;
