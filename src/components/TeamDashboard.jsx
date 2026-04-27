import React, { useState } from 'react';
import { KdsButton, KdsIconCardView, KdsIconGanttChart, MxInputTextBox } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';
import { getCurrentFiscalPeriod } from '../utils/fiscalCalendar';
import EmptyState from './EmptyState';
import TeamMemberCard from './TeamMemberCard';
import GanttChart from './GanttChart';
import CreateMemberModal from './CreateMemberModal';

const currentPeriod = getCurrentFiscalPeriod();

const TeamDashboard = ({ onSelectMember }) => {
  const { ics, teamName, updateTeamName, calculateResults, reorderICs } = useCapacity();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [view, setView] = useState('cards');
  const [editingTeamName, setEditingTeamName] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const handleDragStart = (id) => setDraggedId(id);
  const handleDragOver = (id) => setDragOverId(id);
  const handleDrop = (toId) => {
    if (draggedId && toId && draggedId !== toId) reorderICs(draggedId, toId);
    setDraggedId(null);
    setDragOverId(null);
  };
  const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };
  const { totalAvailable, totalPlanned } = ics.reduce((acc, ic) => {
    const result = calculateResults(ic);
    const avail = result?.totalWeeksAvailable;
    const planned = result?.totalPlannedWork;
    return {
      totalAvailable: acc.totalAvailable + (typeof avail === 'number' && isFinite(avail) ? avail : 0),
      totalPlanned: acc.totalPlanned + (typeof planned === 'number' && isFinite(planned) ? planned : 0),
    };
  }, { totalAvailable: 0, totalPlanned: 0 });

  const totalUtilization = totalAvailable > 0 ? (totalPlanned / totalAvailable) * 100 : null;

  const utilizationColor = totalUtilization === null ? '#6b7280'
    : totalUtilization > 100 ? '#c0392b'
    : totalUtilization >= 90 ? '#b45309'
    : '#1a7f3c';

  const handleNameClick = () => setEditingTeamName(true);

  const handleNameBlur = () => setEditingTeamName(false);

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') e.target.blur();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="kds-Heading kds-Heading--l" style={{ margin: 0 }}>Team Overview</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {ics.length > 0 && view === 'cards' && (
            <KdsButton key={isEditMode ? 'done' : 'edit'} kind="secondary" onClick={() => setIsEditMode(!isEditMode)}>
              {isEditMode ? 'Done' : 'Edit'}
            </KdsButton>
          )}
          <KdsButton kind="primary" onClick={() => setIsCreateModalOpen(true)}>
            + Add Team Member
          </KdsButton>
        </div>
      </div>

      {/* Team summary card */}
      <div className="kds-Card kds-Card--m kds-card-section" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #e8f0fe 0%, #dbeafe 100%)', border: '1.5px solid #0F52A2', boxShadow: '0 2px 8px rgba(15, 82, 162, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {editingTeamName || isEditMode ? (
              <MxInputTextBox
                label="Team Name"
                value={teamName}
                onChange={(e) => updateTeamName(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                placeholder="Enter team name"
                mask="none"
                isClearable={false}
                style={{ width: '320px' }}
              />
            ) : (
              <h2
                className="kds-Heading kds-Heading--l"
                onClick={handleNameClick}
                style={{ margin: 0, cursor: 'text' }}
                title="Click to edit team name"
              >
                {teamName || 'My Team'}
              </h2>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif', lineHeight: 1 }}>{ics.length}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>Members</div>
            </div>
            <div style={{ width: '1px', background: '#e5e7eb' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif', lineHeight: 1 }}>
                {ics.length > 0 ? `${totalAvailable.toFixed(1)}w` : '—'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>Total Available</div>
            </div>
            <div style={{ width: '1px', background: '#e5e7eb' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif', lineHeight: 1 }}>
                {currentPeriod ? `${currentPeriod.quarter} FY${currentPeriod.fiscalYear}` : '—'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                {currentPeriod ? `${currentPeriod.weeksInQuarter} weeks` : 'Quarter'}
              </div>
            </div>
            <div style={{ width: '1px', background: '#e5e7eb' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif', lineHeight: 1, color: utilizationColor }}>
                {totalUtilization !== null ? `${totalUtilization.toFixed(0)}%` : '—'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>Team Capacity</div>
            </div>
          </div>
        </div>
      </div>

      {ics.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn${view === 'cards' ? ' view-toggle-btn--active' : ''}`}
              onClick={() => { setView('cards'); setIsEditMode(false); }}
              title="Card view"
            >
              <KdsIconCardView size="s" />
            </button>
            <button
              className={`view-toggle-btn${view === 'gantt' ? ' view-toggle-btn--active' : ''}`}
              onClick={() => { setView('gantt'); setIsEditMode(false); }}
              title="Gantt view"
            >
              <KdsIconGanttChart size="s" />
            </button>
          </div>
        </div>
      )}

      {ics.length === 0 ? (
        <EmptyState
          title="No team members yet"
          subtitle="Add your first team member to get started"
        />
      ) : view === 'gantt' ? (
        <GanttChart />
      ) : (
        <div className="team-grid">
          {ics.map((ic) => (
            <TeamMemberCard
              key={ic.id}
              ic={ic}
              onSelect={() => !isEditMode && onSelectMember(ic.id)}
              isEditMode={isEditMode}
              isDragging={draggedId === ic.id}
              isDragOver={dragOverId === ic.id}
              onDragStart={() => handleDragStart(ic.id)}
              onDragOver={() => handleDragOver(ic.id)}
              onDrop={() => handleDrop(ic.id)}
              onDragEnd={handleDragEnd}
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
