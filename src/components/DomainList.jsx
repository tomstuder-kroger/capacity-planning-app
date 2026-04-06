import React from 'react';
import { KdsButton, KdsMessage } from 'react-mx-web-components';
import { v4 as uuidv4 } from 'uuid';
import { useCapacity } from '../context/CapacityContext';
import DomainForm from './DomainForm';

const DomainList = () => {
  const { activeIC, updateIC } = useCapacity();

  if (!activeIC) return null;

  const handleAddDomain = () => {
    const newDomain = {
      id: uuidv4(),
      name: '',
      smallProjects: 0,
      mediumProjects: 0,
      largeProjects: 0
    };
    updateIC(activeIC.id, {
      domains: [...activeIC.domains, newDomain]
    });
  };

  return (
    <div>
      <h2 className="kds-Heading kds-Heading--s section-heading">Domains &amp; Planned Work</h2>

      {activeIC.domains.length === 0 ? (
        <div className="kds-Card kds-Card--m kds-card-section">
          <KdsMessage kind="info">
            No domains added yet. Click "Add Domain" to start.
          </KdsMessage>
        </div>
      ) : (
        activeIC.domains.map(domain => (
          <DomainForm key={domain.id} domain={domain} />
        ))
      )}

      <KdsButton kind="secondary" style={{ width: '100%' }} onClick={handleAddDomain}>
        + Add Domain
      </KdsButton>
    </div>
  );
};

export default DomainList;
