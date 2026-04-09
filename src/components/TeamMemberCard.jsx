import React, { useState } from 'react';
import { KdsButton, KdsIconTrash, KdsTag, MxInputTextBox, MxSingleSelect } from 'react-mx-web-components';
import { MxModal, MxModalBody } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';

const STATUS_COLORS = {
  under: '#1a7f3c',
  fully: '#b45309',
  over:  '#c0392b',
};

const TeamMemberCard = ({ ic, onSelect, isEditMode, isDragging, isDragOver, onDragStart, onDragOver, onDrop, onDragEnd }) => {
  const { deleteIC, updateIC, calculateResults } = useCapacity();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const calculated = calculateResults(ic);
  const utilization = calculated?.capacityUtilization;
  const status = calculated?.status;
  const hasUtilization = typeof utilization === 'number' && isFinite(utilization);

  const totalSmall = ic.domains.reduce((sum, d) => sum + (Number(d.smallProjects) || 0), 0);
  const totalMedium = ic.domains.reduce((sum, d) => sum + (Number(d.mediumProjects) || 0), 0);
  const totalLarge = ic.domains.reduce((sum, d) => sum + (Number(d.largeProjects) || 0), 0);
  const projectSummary = [
    totalLarge > 0 && `${totalLarge} Large`,
    totalMedium > 0 && `${totalMedium} Medium`,
    totalSmall > 0 && `${totalSmall} Small`,
  ].filter(Boolean).join(', ');
  const totalProjects = totalSmall + totalMedium + totalLarge;

  const statusKind = status === 'over' ? 'negative' : status === 'fully' ? 'callout' : 'positive';

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
        draggable={isEditMode}
        onDragStart={onDragStart}
        onDragOver={(e) => { e.preventDefault(); onDragOver?.(); }}
        onDrop={(e) => { e.preventDefault(); onDrop?.(); }}
        onDragEnd={onDragEnd}
        style={{
          cursor: isEditMode ? 'grab' : 'pointer',
          opacity: isDragging ? 0.4 : 1,
          outline: isDragOver ? '2px dashed #0F52A2' : 'none',
          transition: 'opacity 0.2s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isEditMode && (
            <div style={{ color: '#9ca3af', fontSize: '1.1rem', marginRight: '0.5rem', flexShrink: 0, userSelect: 'none', cursor: 'grab' }}>⠿</div>
          )}
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

          {isEditMode ? (
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
          ) : hasUtilization && (
            <div style={{ textAlign: 'center', marginLeft: '1rem', flexShrink: 0 }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                fontFamily: 'Nunito, sans-serif',
                lineHeight: 1,
                color: STATUS_COLORS[status] || '#000',
              }}>
                {utilization.toFixed(0)}%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '4px' }}>Capacity</div>
            </div>
          )}
        </div>

        {!isEditMode && ic.domains.length > 0 && (
          <div className="tag-row" style={{ marginTop: '0.75rem' }}>
            <KdsTag kind={statusKind}>{ic.domains.length} Domain(s)</KdsTag>
            {totalProjects > 0 && (
              <KdsTag kind="default">{projectSummary}</KdsTag>
            )}
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
