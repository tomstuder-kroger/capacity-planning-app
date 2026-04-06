import React, { useState } from 'react';
import { KdsInput, KdsLabel, KdsButton, KdsMessage } from 'react-mx-web-components';
import { MxModal, MxModalBody } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';
import { validateDomainName, validateNonNegativeInteger } from '../utils/validation';
import { calculateDomainEffort } from '../utils/calculations';

const DomainForm = ({ domain }) => {
  const { activeIC, updateIC } = useCapacity();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!activeIC) return null;

  const handleDomainChange = (field, value) => {
    let processedValue = value;
    if (['smallProjects', 'mediumProjects', 'largeProjects'].includes(field)) {
      processedValue = value === '' ? 0 : Number(value);
    }

    const updatedDomains = activeIC.domains.map(d =>
      d.id === domain.id ? { ...d, [field]: processedValue } : d
    );
    updateIC(activeIC.id, { domains: updatedDomains });
  };

  const handleRemove = () => {
    setDeleteDialogOpen(true);
  };

  const handleRemoveConfirm = () => {
    const updatedDomains = activeIC.domains.filter(d => d.id !== domain.id);
    updateIC(activeIC.id, { domains: updatedDomains });
    setDeleteDialogOpen(false);
  };

  const handleRemoveCancel = () => {
    setDeleteDialogOpen(false);
  };

  const nameError = validateDomainName(domain.name);
  const smallError = validateNonNegativeInteger(domain.smallProjects);
  const mediumError = validateNonNegativeInteger(domain.mediumProjects);
  const largeError = validateNonNegativeInteger(domain.largeProjects);

  const totalWeeks = calculateDomainEffort({
    small: domain.smallProjects,
    medium: domain.mediumProjects,
    large: domain.largeProjects
  });

  return (
    <>
      <div className="kds-Card kds-Card--m kds-card-section">
        <div className="domain-header">
          <h2 className="kds-Heading kds-Heading--s" style={{ margin: 0 }}>Domain</h2>
          <KdsButton kind="destructive" variant="minimal" onClick={handleRemove} aria-label="Remove domain">
            ✕
          </KdsButton>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <KdsLabel>
            Domain Name
            <KdsInput
              type="text"
              placeholder="e.g., TEST"
              value={domain.name}
              onChange={(e) => handleDomainChange('name', e.target.value)}
              invalid={!!nameError}
            />
          </KdsLabel>
          {nameError && <KdsMessage kind="error">{nameError}</KdsMessage>}
        </div>

        <div className="form-grid-3col">
          <div>
            <KdsLabel>
              Small Projects (2w ea)
              <KdsInput
                type="number"
                value={domain.smallProjects}
                onChange={(e) => handleDomainChange('smallProjects', e.target.value)}
                invalid={!!smallError}
                min={0}
                step={1}
              />
            </KdsLabel>
            {smallError && <KdsMessage kind="error">{smallError}</KdsMessage>}
          </div>
          <div>
            <KdsLabel>
              Medium Projects (4w ea)
              <KdsInput
                type="number"
                value={domain.mediumProjects}
                onChange={(e) => handleDomainChange('mediumProjects', e.target.value)}
                invalid={!!mediumError}
                min={0}
                step={1}
              />
            </KdsLabel>
            {mediumError && <KdsMessage kind="error">{mediumError}</KdsMessage>}
          </div>
          <div>
            <KdsLabel>
              Large Projects (8w ea)
              <KdsInput
                type="number"
                value={domain.largeProjects}
                onChange={(e) => handleDomainChange('largeProjects', e.target.value)}
                invalid={!!largeError}
                min={0}
                step={1}
              />
            </KdsLabel>
            {largeError && <KdsMessage kind="error">{largeError}</KdsMessage>}
          </div>
        </div>

        <div className="summary-box">
          <span>Domain total: <strong>{totalWeeks.toFixed(1)} weeks</strong></span>
        </div>
      </div>

      <MxModal
        isOpened={deleteDialogOpen}
        headercontent="Remove Domain"
        footerPrimaryButtonText="Remove"
        footerPrimaryButtonKind="destructive"
        footerSecondaryButtonText="Cancel"
        closeOnSecondaryButton
        onApplyClick={handleRemoveConfirm}
        onSecondaryClick={handleRemoveCancel}
        onModalClose={handleRemoveCancel}
      >
        <MxModalBody>
          Remove domain "{domain.name || 'Untitled'}"?
        </MxModalBody>
      </MxModal>
    </>
  );
};

export default DomainForm;
