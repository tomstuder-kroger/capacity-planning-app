import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { GridViewIcon, ChartGanttIcon } from '@hugeicons/core-free-icons';
import { useCapacity } from '../context/CapacityContext';
import { getCurrentFiscalPeriod } from '../utils/fiscalCalendar';
import EmptyState from './EmptyState';
import TeamMemberCard from './TeamMemberCard';
import GanttChart from './GanttChart';
import CreateMemberModal from './CreateMemberModal';
import ImportMemberModal from './ImportMemberModal';

const currentPeriod = getCurrentFiscalPeriod();

const TeamDashboard = ({ onSelectMember }) => {
  const { ics, teamName, updateTeamName, calculateResults, reorderICs } = useCapacity();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [view, setView] = useState('cards');
  const [ganttQuarter, setGanttQuarter] = useState(null);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Team Overview</h2>
        <div className="flex gap-3 items-center">
          {ics.length > 0 && view === 'cards' && (
            <Button key={isEditMode ? 'done' : 'edit'} variant="outline" onClick={() => setIsEditMode(!isEditMode)}>
              {isEditMode ? 'Done' : 'Edit'}
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            Import Team Member
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            + Add Team Member
          </Button>
        </div>
      </div>

      {/* Team summary card */}
      <div className="mb-6 p-5 rounded-lg" style={{ background: 'rgb(239, 247, 253)', border: '1px solid rgb(15, 82, 162)' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {editingTeamName || isEditMode ? (
              <Input
                value={teamName}
                onChange={(e) => updateTeamName(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                placeholder="Enter team name"
                className="w-80"
                autoFocus={editingTeamName}
              />
            ) : (
              <h2
                className="text-xl font-bold cursor-text"
                onClick={handleNameClick}
                title="Click to edit team name"
              >
                {teamName || 'My Team'}
              </h2>
            )}
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold font-sans leading-none">{ics.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Members</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold font-sans leading-none">
                {ics.length > 0 ? `${totalAvailable.toFixed(1)}w` : '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Total Available</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold font-sans leading-none">
                {currentPeriod ? `${currentPeriod.quarter} FY${currentPeriod.fiscalYear}` : '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {currentPeriod ? `${currentPeriod.weeksInQuarter} weeks` : 'Quarter'}
              </div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold font-sans leading-none" style={{ color: utilizationColor }}>
                {totalUtilization !== null ? `${totalUtilization.toFixed(0)}%` : '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Team Capacity</div>
            </div>
          </div>
        </div>
      </div>

      {/* View controls */}
      {ics.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="inline-flex border border-border rounded-md overflow-hidden bg-card">
              <button
                className={`px-2 py-1.5 flex items-center justify-center border-r border-border cursor-pointer transition-colors ${view === 'cards' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                onClick={() => { setView('cards'); setIsEditMode(false); }}
                title="Card view"
              >
                <HugeiconsIcon icon={GridViewIcon} strokeWidth={2} size={16} />
              </button>
              <button
                className={`px-2 py-1.5 flex items-center justify-center cursor-pointer transition-colors ${view === 'gantt' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                onClick={() => { setView('gantt'); setIsEditMode(false); }}
                title="Gantt view"
              >
                <HugeiconsIcon icon={ChartGanttIcon} strokeWidth={2} size={16} />
              </button>
            </div>

            {/* Quarter filter for Gantt */}
            {view === 'gantt' && (
              <div className="inline-flex border border-border rounded-md overflow-hidden bg-card">
                {[null, 'Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => (
                  <button
                    key={q ?? 'all'}
                    className={`px-2.5 py-1.5 text-xs cursor-pointer transition-colors ${i > 0 ? 'border-l border-border' : ''} ${ganttQuarter === q ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                    onClick={() => setGanttQuarter(q)}
                  >
                    {q ?? 'All'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {ics.length === 0 ? (
        <EmptyState
          title="No team members yet"
          subtitle="Add your first team member to get started"
        />
      ) : view === 'gantt' ? (
        <GanttChart quarterFilter={ganttQuarter} />
      ) : (
        <div className="grid grid-cols-3 gap-4 mt-4 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
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
      <ImportMemberModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};

export default TeamDashboard;
