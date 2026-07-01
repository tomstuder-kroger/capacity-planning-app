import React from 'react';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { useCapacity } from '../context/CapacityContext';
import DomainForm from './DomainForm';
import EmptyState from './EmptyState';

const DomainList = () => {
  const { activeIC, updateIC } = useCapacity();

  if (!activeIC) return null;

  const handleAddDomain = () => {
    const newDomain = { id: uuidv4(), name: '', projects: [] };
    updateIC(activeIC.id, { domains: [...activeIC.domains, newDomain] });
  };

  return (
    <div>
      <h2 className="mb-4 text-base font-bold">Domains &amp; Planned Work</h2>

      {activeIC.domains.length === 0 ? (
        <div className="mb-4 p-6 bg-card rounded-lg border">
          <EmptyState
            title="No domains added yet"
            subtitle='Click "+ Add Domain" below to start planning your work'
          />
        </div>
      ) : (
        activeIC.domains.map(domain => (
          <DomainForm key={domain.id} domain={domain} />
        ))
      )}

      <Button variant="outline" className="w-full" onClick={handleAddDomain}>
        + Add Domain
      </Button>
    </div>
  );
};

export default DomainList;
