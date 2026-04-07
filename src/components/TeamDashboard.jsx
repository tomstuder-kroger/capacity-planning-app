import React, { useState } from 'react';
import { KdsButton } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';
import EmptyState from './EmptyState';
import TeamMemberCard from './TeamMemberCard';
import CreateMemberModal from './CreateMemberModal';

const TeamDashboard = ({ onSelectMember }) => {
  const { ics } = useCapacity();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="kds-Heading kds-Heading--l" style={{ margin: 0 }}>My Team</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {ics.length > 0 && (
            <KdsButton kind="secondary" onClick={() => setIsEditMode(!isEditMode)}>
              {isEditMode ? 'Done' : 'Edit'}
            </KdsButton>
          )}
          <KdsButton kind="primary" onClick={() => setIsCreateModalOpen(true)}>
            + Add Team Member
          </KdsButton>
        </div>
      </div>

      {ics.length === 0 ? (
        <EmptyState
          title="No team members yet"
          subtitle="Add your first team member to get started"
        />
      ) : (
        <div className="team-grid">
          {ics.map((ic) => (
            <TeamMemberCard
              key={ic.id}
              ic={ic}
              onSelect={() => !isEditMode && onSelectMember(ic.id)}
              isEditMode={isEditMode}
            />
          ))}
        </div>
      )}

      <CreateMemberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={onSelectMember}
      />
    </div>
  );
};

export default TeamDashboard;
