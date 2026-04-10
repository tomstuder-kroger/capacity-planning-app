import React, { useState } from 'react';
import { KdsButton, KdsIconTrash, MxInputTextBox } from 'react-mx-web-components';
import { MxModal, MxModalBody } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';
import { calculateDomainEffort } from '../utils/calculations';

const DomainForm = ({ domain }) => {
  const { activeIC, updateIC } = useCapacity();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!activeIC) return null;

  const handleDomainChange = (field, value) => {
    let processedValue = value;
    if (['smallProjects', 'mediumProjects', 'largeProjects', 'extraLargeProjects'].includes(field)) {
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

  const totalWeeks = calculateDomainEffort({
    small: domain.smallProjects,
    medium: domain.mediumProjects,
    large: domain.largeProjects,
    extraLarge: domain.extraLargeProjects ?? 0
  });

  return (
    <>
      <div className="kds-Card kds-Card--m kds-card-section">
        <div className="domain-header">
          <h2 className="kds-Heading kds-Heading--s" style={{ margin: 0 }}>Domain</h2>
          <KdsButton palette="negative" kind="subtle" variant="minimal" onClick={handleRemove} aria-label="Remove domain">
            <KdsIconTrash size="s" />
          </KdsButton>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <MxInputTextBox
            label="Domain Name"
            placeholder="e.g., TEST"
            value={domain.name}
            onChange={(e) => handleDomainChange('name', e.target.value)}
            mask="none"
            isClearable={false}
          />
        </div>

        <div className="form-grid-4col">
          <div>
            <MxInputTextBox
              label="Sm. Projects (2w)"
              value={String(domain.smallProjects)}
              onChange={(e) => handleDomainChange('smallProjects', e.target.value)}
              mask="none"
              isClearable={false}
            />
          </div>
          <div>
            <MxInputTextBox
              label="Med. Projects (4w)"
              value={String(domain.mediumProjects)}
              onChange={(e) => handleDomainChange('mediumProjects', e.target.value)}
              mask="none"
              isClearable={false}
            />
          </div>
          <div>
            <MxInputTextBox
              label="Lg. Projects (8w)"
              value={String(domain.largeProjects)}
              onChange={(e) => handleDomainChange('largeProjects', e.target.value)}
              mask="none"
              isClearable={false}
            />
          </div>
          <div>
            <MxInputTextBox
              label="Ex Lg. Projects (9+w)"
              value={String(domain.extraLargeProjects ?? 0)}
              onChange={(e) => handleDomainChange('extraLargeProjects', e.target.value)}
              mask="none"
              isClearable={false}
            />
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
