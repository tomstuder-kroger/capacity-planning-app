import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCapacity } from '../context/CapacityContext';
import SinglePersonGantt from './SinglePersonGantt';
import FormattedOutput from './FormattedOutput';
import TimeOffForm from './TimeOffForm';
import DomainList from './DomainList';

const PERSON_HUES = [217, 158, 43, 271, 5, 185, 82, 316, 24, 340];

const STATUS_COLORS = {
  under: '#1a7f3c',
  fully: '#1a7f3c',
  over: '#c0392b',
};

const personColor = (icIndex) =>
  `hsl(${PERSON_HUES[icIndex % PERSON_HUES.length]}, 65%, 38%)`;

const MemberListItem = ({ ic, icIndex, isSelected, onClick }) => {
  const { calculateResults } = useCapacity();
  const calculated = calculateResults(ic);
  const utilization = calculated?.capacityUtilization;
  const status = calculated?.status;
  const hasUtil = typeof utilization === 'number' && isFinite(utilization);

  return (
    <button
      className={`w-full text-left px-4 py-3 border-b border-border flex items-center gap-3 transition-colors ${isSelected ? 'bg-primary/8' : 'hover:bg-muted'}`}
      onClick={onClick}
      style={{ borderLeft: `4px solid ${personColor(icIndex)}` }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-heading font-semibold text-sm truncate">{ic.icName || 'Unnamed'}</div>
        <div className="text-xs text-muted-foreground truncate mt-0.5">{ic.icRole || 'No role set'}</div>
      </div>
      {hasUtil && (
        <div
          className="text-sm font-bold tabular-nums shrink-0"
          style={{ color: utilization === 0 ? '#9ca3af' : STATUS_COLORS[status] || '#000' }}
        >
          {utilization.toFixed(0)}%
        </div>
      )}
    </button>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-muted rounded-lg p-4">
    <div className="text-2xl font-bold leading-none" style={color ? { color } : {}}>
      {value}
    </div>
    <div className="text-xs text-muted-foreground mt-1.5">{label}</div>
  </div>
);

const MemberDetailPanel = ({ ic, icIndex, onEdit }) => {
  const { calculateResults, setActiveIC } = useCapacity();
  const [summaryOpen, setSummaryOpen] = useState(false);

  if (!ic) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Select a team member to view their details
      </div>
    );
  }

  const calculated = calculateResults(ic);
  const utilization = calculated?.capacityUtilization;
  const status = calculated?.status;
  const totalAvailable = calculated?.totalWeeksAvailable;
  const totalPlanned = calculated?.totalPlannedWork;
  const totalTimeOff = calculated?.totalTimeOffWeeks;
  const domainEfforts = calculated?.domainEfforts ?? [];

  const hasUtil = typeof utilization === 'number' && isFinite(utilization);
  const utilizationColor = !hasUtil || utilization === 0
    ? '#9ca3af'
    : STATUS_COLORS[status] || '#000';

  const color = personColor(icIndex);

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-12 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <div>
            <h2 className="font-heading text-xl font-bold leading-tight">{ic.icName || 'Unnamed'}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{ic.icRole || 'No role set'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setActiveIC(ic.id); setSummaryOpen(true); }}>
            View Summary
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>Edit Plan</Button>
        </div>
      </div>

      <FormattedOutput open={summaryOpen} onClose={() => setSummaryOpen(false)} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard
          label="Utilization"
          value={hasUtil ? `${utilization.toFixed(0)}%` : '—'}
          color={utilizationColor}
        />
        <StatCard
          label="Available"
          value={typeof totalAvailable === 'number' ? `${totalAvailable.toFixed(1)}w` : '—'}
        />
        <StatCard
          label="Planned"
          value={typeof totalPlanned === 'number' ? `${totalPlanned.toFixed(1)}w` : '—'}
        />
      </div>

      {/* Utilization bar */}
      {hasUtil && (
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(utilization, 100)}%`,
                backgroundColor: utilizationColor,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Domains & Projects */}
      {domainEfforts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Domains & Projects
          </h3>
          <div className="space-y-3">
            {domainEfforts.map((effort, di) => {
              const rawProjects = ic.domains[di]?.projects ?? [];
              return (
                <div key={effort.domainId} className="border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
                    <span className="font-semibold text-sm">{effort.domainName || 'Unnamed Domain'}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{effort.totalWeeks.toFixed(1)}w</span>
                  </div>
                  {rawProjects.length > 0 ? (
                    <div className="divide-y divide-border/60">
                      {rawProjects.map((project, pi) => {
                        const projectWeeks = effort.projects[pi]?.weeks ?? 0;
                        return (
                          <div key={project.id} className="flex items-center justify-between px-3 py-2 text-sm">
                            <span className="truncate mr-3">{project.title || 'Untitled'}</span>
                            <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                              {project.startDate && <span>{project.startDate}</span>}
                              <span className="font-medium text-foreground tabular-nums">{projectWeeks}w</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="px-3 py-2 text-xs text-muted-foreground italic">No projects</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Time Off */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Time Off
        </h3>
        <div className="border border-border rounded-lg overflow-hidden divide-y divide-border/60 text-sm">
          {ic.timeOff?.okrTime?.value ? (
            <div className="flex justify-between px-3 py-2">
              <span className="text-muted-foreground">OKR Time</span>
              <span>{ic.timeOff.okrTime.value} {ic.timeOff.okrTime.unit}</span>
            </div>
          ) : null}
          {Number(ic.timeOff?.devDays) > 0 && (
            <div className="flex justify-between px-3 py-2">
              <span className="text-muted-foreground">Dev / L&D</span>
              <span>{ic.timeOff.devDays} days</span>
            </div>
          )}
          {Number(ic.timeOff?.holidayDays) > 0 && (
            <div className="flex justify-between px-3 py-2">
              <span className="text-muted-foreground">Holidays</span>
              <span>{ic.timeOff.holidayDays} days</span>
            </div>
          )}
          {(ic.ptoInstances?.length ?? 0) > 0 && (
            <div className="flex justify-between px-3 py-2">
              <span className="text-muted-foreground">PTO entries</span>
              <span>{ic.ptoInstances.length}</span>
            </div>
          )}
          <div className="flex justify-between px-3 py-2 font-semibold bg-muted/40">
            <span>Total</span>
            <span>{typeof totalTimeOff === 'number' ? `${totalTimeOff.toFixed(1)} weeks` : '—'}</span>
          </div>
        </div>
      </div>

      {/* Current quarter Gantt */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Current Quarter Schedule
        </h3>
        <SinglePersonGantt ic={ic} icIndex={icIndex} />
      </div>
    </div>
  );
};

const EditPanel = ({ ic, icIndex, onDone }) => {
  const { setActiveIC } = useCapacity();

  useEffect(() => {
    setActiveIC(ic.id);
  }, [ic.id, setActiveIC]);

  return (
    <div className="h-full overflow-y-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-card border-b px-6 py-3 flex items-center justify-end shrink-0">
        <Button size="sm" onClick={onDone}>Done</Button>
      </div>

      {/* Forms */}
      <div className="p-6">
        <TimeOffForm />
        <DomainList />
      </div>
    </div>
  );
};

const MemberListView = () => {
  const { ics } = useCapacity();
  const [selectedId, setSelectedId] = useState(ics[0]?.id ?? null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!ics.find(ic => ic.id === selectedId) && ics.length > 0) {
      setSelectedId(ics[0].id);
    }
  }, [ics, selectedId]);

  const handleSelectMember = (id) => {
    setSelectedId(id);
    setIsEditing(false);
  };

  const selectedIC = ics.find(ic => ic.id === selectedId) ?? null;
  const selectedIndex = ics.findIndex(ic => ic.id === selectedId);
  const icIndex = selectedIndex === -1 ? 0 : selectedIndex;

  return (
    <div
      className="flex border border-border rounded-lg overflow-hidden bg-card"
      style={{ height: 'calc(100vh - 16rem)' }}
    >
      {/* Left: member list */}
      <div className="w-72 shrink-0 border-r border-border overflow-y-auto">
        {ics.map((ic, i) => (
          <MemberListItem
            key={ic.id}
            ic={ic}
            icIndex={i}
            isSelected={ic.id === selectedId}
            onClick={() => handleSelectMember(ic.id)}
          />
        ))}
      </div>

      {/* Right: detail or edit */}
      <div className="flex-1 min-w-0">
        {isEditing && selectedIC ? (
          <EditPanel
            ic={selectedIC}
            icIndex={icIndex}
            onDone={() => setIsEditing(false)}
          />
        ) : (
          <MemberDetailPanel
            ic={selectedIC}
            icIndex={icIndex}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </div>
    </div>
  );
};

export default MemberListView;
