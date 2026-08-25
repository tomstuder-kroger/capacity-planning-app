import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { ChartGanttIcon, LayoutLeftIcon } from '@hugeicons/core-free-icons';
import { useCapacity } from '../context/CapacityContext';
import { getCurrentFiscalPeriod } from '../utils/fiscalCalendar';
import EmptyState from './EmptyState';
import GanttChart from './GanttChart';
import CreateMemberModal from './CreateMemberModal';
import BulkImportModal from './BulkImportModal';
import ExportDataModal from './ExportDataModal';
import MemberListView from './MemberListView';

const currentPeriod = getCurrentFiscalPeriod();

const TeamDashboard = ({ onSelectMember }) => {
  const { ics, teamName, updateTeamName, calculateResults } = useCapacity();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [view, setView] = useState('list');
  const [ganttQuarter, setGanttQuarter] = useState(null);

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

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') e.target.blur();
  };

  return (
    <div>
      {/* Full-width header bar */}
      <div className="sticky top-14 z-40 w-full bg-card border-b">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center gap-6">
          {/* Team name */}
          <div className="shrink-0 min-w-[160px]">
            {isEditingName ? (
              <Input
                value={teamName}
                onChange={(e) => updateTeamName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={() => setIsEditingName(false)}
                placeholder="Enter team name"
                className="w-60"
                autoFocus
              />
            ) : (
              <h2 className="text-lg font-bold">
                {teamName || 'My Team'}
              </h2>
            )}
          </div>

          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0">
            <Button key={isEditingName ? 'done' : 'edit'} variant="outline" onClick={() => setIsEditingName(!isEditingName)}>
              {isEditingName ? 'Done' : 'Edit'}
            </Button>
            <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
              Export
            </Button>
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
              Import
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              + Add Member
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">

      {/* Metrics + view controls row */}
      {ics.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          {/* Metrics — left aligned */}
          <div className="flex items-center gap-6">
            <div>
              <div className="text-2xl font-bold font-sans leading-none">{ics.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Members</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <div className="text-2xl font-bold font-sans leading-none">
                {ics.length > 0 ? `${totalAvailable.toFixed(1)}w` : '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Total Available</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <div className="text-2xl font-bold font-sans leading-none">
                {currentPeriod ? `${currentPeriod.quarter} FY${currentPeriod.fiscalYear}` : '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {currentPeriod ? `${currentPeriod.weeksInQuarter} weeks` : 'Quarter'}
              </div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <div className="text-2xl font-bold font-sans leading-none" style={{ color: utilizationColor }}>
                {totalUtilization !== null ? `${totalUtilization.toFixed(0)}%` : '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Team Capacity</div>
            </div>
          </div>

          {/* View controls — right aligned */}
          <div className="flex items-center gap-3">
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

            {/* View toggle */}
            <div className="inline-flex border border-border rounded-md overflow-hidden bg-card">
              <button
                className={`px-2 py-1.5 flex items-center justify-center border-r border-border cursor-pointer transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                onClick={() => setView('list')}
                title="List view"
              >
                <HugeiconsIcon icon={LayoutLeftIcon} strokeWidth={2} size={16} />
              </button>
              <button
                className={`px-2 py-1.5 flex items-center justify-center cursor-pointer transition-colors ${view === 'gantt' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                onClick={() => setView('gantt')}
                title="Gantt view"
              >
                <HugeiconsIcon icon={ChartGanttIcon} strokeWidth={2} size={16} />
              </button>
            </div>
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
        <MemberListView />
      )}

      <CreateMemberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={onSelectMember}
      />
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImported={onSelectMember}
      />
      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
      </div>
    </div>
  );
};

export default TeamDashboard;
