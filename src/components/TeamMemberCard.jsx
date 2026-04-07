import React, { useState } from 'react';
import { KdsButton, KdsIconTrash, MxInputTextBox, MxSingleSelect } from 'react-mx-web-components';
import { MxModal, MxModalBody } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';

const STATUS_COLORS = {
  under: '#1a7f3c',
  fully: '#b45309',
  over:  '#c0392b',
};

const TeamMemberCard = ({ ic, onSelect, isEditMode }) => {
  const { deleteIC, updateIC, calculateResults } = useCapacity();
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

  const handleNameChange = (e) => {
    updateIC(ic.id, { icName: e.target.value });
  };

  const handleRoleChange = (e) => {
    updateIC(ic.id, { icRole: e.detail });
  };

  return (
    <>
      <div
        className="kds-Card kds-Card--m kds-card-section team-member-card"
        onClick={!isEditMode ? onSelect : undefined}
        style={{ cursor: isEditMode ? 'default' : 'pointer' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                <MxInputTextBox
                  label="Name"
                  value={ic.icName}
                  onChange={handleNameChange}
                  mask="none"
                  isClearable={false}
                />
                <MxSingleSelect
                  label="Role"
                  items={['APD', 'PD', 'SPD']}
                  value={ic.icRole}
                  emitOnlyValue
                  onValueUpdate={handleRoleChange}
                />
              </div>
            ) : (
              <>
                <div className="team-card-name">{ic.icName || 'Unnamed'}</div>
                <div className="team-card-role">{ic.icRole || 'No role set'}</div>
              </>
            )}
          </div>
          {isEditMode && (
            <KdsButton
              palette="negative"
              kind="subtle"
              variant="minimal"
              onClick={handleDeleteClick}
              aria-label="Remove team member"
              style={{ marginLeft: '0.5rem', flexShrink: 0 }}
            >
              <KdsIconTrash size="s" />
            </KdsButton>
          )}
        </div>

        {!isEditMode && hasUtilization && (
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
