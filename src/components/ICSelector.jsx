import React, { useState } from 'react';
import { KdsButton, KdsSelect, KdsLabel } from 'react-mx-web-components';
import { MxModal, MxModalBody } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';

const ICSelector = () => {
  const {
    ics,
    activeICId,
    activeIC,
    createIC,
    deleteIC,
    setActiveIC,
    duplicateIC
  } = useCapacity();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleCreateIC = () => {
    createIC();
  };

  const handleDuplicateIC = () => {
    if (activeICId) {
      duplicateIC(activeICId);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (activeICId) {
      deleteIC(activeICId);
    }
    setDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleICChange = (event) => {
    setActiveIC(event.target.value);
  };

  const getICDisplayName = (ic) => {
    if (ic.icName && ic.quarter) {
      return `${ic.icName} - ${ic.quarter}`;
    } else if (ic.icName) {
      return ic.icName;
    } else if (ic.quarter) {
      return `Untitled - ${ic.quarter}`;
    } else {
      return 'Untitled IC';
    }
  };

  return (
    <div className="kds-Card kds-Card--m kds-card-section" style={{ marginBottom: '1.5rem' }}>
      <div className="ic-selector-bar">
        <KdsButton kind="primary" onClick={handleCreateIC}>
          + New IC
        </KdsButton>

        {ics.length > 0 && (
          <>
            <div className="ic-select-wrapper">
              <KdsLabel>
                Select IC
                <KdsSelect value={activeICId || ''} onChange={handleICChange}>
                  <option value="" disabled>Select IC...</option>
                  {ics.map((ic) => (
                    <option key={ic.id} value={ic.id}>
                      {getICDisplayName(ic)}
                    </option>
                  ))}
                </KdsSelect>
              </KdsLabel>
            </div>

            <div className="ic-actions">
              <KdsButton
                kind="secondary"
                onClick={handleDuplicateIC}
                disabled={!activeIC}
              >
                Duplicate
              </KdsButton>
              <KdsButton
                kind="destructive"
                onClick={handleDeleteClick}
                disabled={!activeIC}
              >
                Delete
              </KdsButton>
            </div>
          </>
        )}

        {ics.length === 0 && (
          <span style={{ color: '#6b7280', textAlign: 'left', display: 'block' }}>No ICs yet. Click "New IC" to get started.</span>
        )}
      </div>

      <MxModal
        isOpened={deleteDialogOpen}
        headercontent="Delete IC?"
        footerPrimaryButtonText="Delete"
        footerPrimaryButtonKind="destructive"
        footerSecondaryButtonText="Cancel"
        closeOnSecondaryButton
        onApplyClick={handleDeleteConfirm}
        onSecondaryClick={handleDeleteCancel}
        onModalClose={handleDeleteCancel}
      >
        <MxModalBody>
          Are you sure you want to delete "{activeIC ? getICDisplayName(activeIC) : 'this IC'}"? This action cannot be undone.
        </MxModalBody>
      </MxModal>
    </div>
  );
};

export default ICSelector;
