import React, { useState } from 'react';
import { KdsButton } from 'react-mx-web-components';
import { MxModal, MxModalBody } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';

const STATUS_COLORS = {
  under: '#1a7f3c',
  fully: '#b45309',
  over:  '#c0392b',
};

const TeamMemberCard = ({ ic, onSelect, isEditMode }) => {
  const { deleteIC, calculateResults } = useCapacity();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const calculated = calculateResults(ic);
  const utilization = calculated?.capacityUtilization;
  const status = calculated?.status;
  const hasUtilization = typeof utilization === 'number' && isFinite(utilization);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteIC(ic.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div
        className="kds-Card kds-Card--m kds-card-section team-member-card"
        onClick={onSelect}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="team-card-name">{ic.icName || 'Unnamed'}</div>
            <div className="team-card-role">{ic.icRole || 'No role set'}</div>
          </div>
          {isEditMode && (
            <KdsButton
              kind="destructive"
              variant="minimal"
              onClick={handleDeleteClick}
              aria-label="Remove team member"
            >
              ✕
            </KdsButton>
          )}
        </div>

        {hasUtilization && (
          <div style={{
            marginTop: '12px',
            fontSize: '22px',
            fontWeight: 700,
            color: STATUS_COLORS[status] || '#000',
            fontFamily: 'Nunito, sans-serif',
          }}>
            {utilization.toFixed(0)}%
            <span style={{ fontSize: '12px', fontWeight: 400, color: '#6b7280', marginLeft: '4px' }}>
              capacity
            </span>
          </div>
        )}
      </div>

      <MxModal
        isOpened={deleteDialogOpen}
        headercontent="Remove Team Member"
        footerPrimaryButtonText="Remove"
        footerPrimaryButtonKind="destructive"
        footerSecondaryButtonText="Cancel"
        closeOnSecondaryButton
        onApplyClick={handleDeleteConfirm}
        onSecondaryClick={() => setDeleteDialogOpen(false)}
        onModalClose={() => setDeleteDialogOpen(false)}
      >
        <MxModalBody>
          Remove "{ic.icName || 'Unnamed'}" from your team? This cannot be undone.
        </MxModalBody>
      </MxModal>
    </>
  );
};

export default TeamMemberCard;
