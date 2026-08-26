import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, PanelLeftIcon, Edit02Icon } from '@hugeicons/core-free-icons';
import { useCapacity } from '../context/CapacityContext';
import { getCurrentFiscalPeriod } from '../utils/fiscalCalendar';
import { getProjectWeeks } from '../utils/calculations';
import SinglePersonGantt from './SinglePersonGantt';
import CapacityLineChart from './CapacityLineChart';
import FormattedOutput from './FormattedOutput';
import TimeOffForm from './TimeOffForm';
import DomainList from './DomainList';
import ICInfoForm from './ICInfoForm';

const PERSON_HUES = [217, 158, 43, 271, 5, 185, 82, 316, 24, 340];

const STATUS_COLORS = {
  under: '#1a7f3c',
  fully: '#1a7f3c',
  over: '#c0392b',
};

const QUARTER_ORDER = { Q1: 0, Q2: 1, Q3: 2, Q4: 3 };

const groupPastProjects = (pastProjects) => {
  const groups = {};
  (pastProjects || []).forEach((p) => {
    if (!groups[p.quarterLabel]) {
      groups[p.quarterLabel] = { label: p.quarterLabel, fiscalYear: p.fiscalYear, quarter: p.quarter, projects: [] };
    }
    groups[p.quarterLabel].projects.push(p);
  });

  return Object.values(groups).sort((a, b) => {
    const rank = (g) => (g.fiscalYear ?? 0) * 4 + (QUARTER_ORDER[g.quarter] ?? 0);
    return rank(b) - rank(a);
  });
};

const personColor = (icIndex) =>
  `hsl(${PERSON_HUES[icIndex % PERSON_HUES.length]}, 65%, 38%)`;

const MemberListItem = ({ ic, icIndex, isSelected, onClick, onDelete }) => {
  const { calculateResults } = useCapacity();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const calculated = calculateResults(ic);
  const utilization = calculated?.capacityUtilization;
  const status = calculated?.status;
  const hasUtil = typeof utilization === 'number' && isFinite(utilization);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (confirmingDelete) {
      onDelete(ic.id);
    } else {
      setConfirmingDelete(true);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`w-full text-left px-4 py-3 border-b border-border flex items-center gap-3 transition-colors cursor-pointer ${isSelected ? 'bg-primary/8' : 'hover:bg-muted'}`}
      onClick={onClick}
      onBlur={() => setConfirmingDelete(false)}
      style={{ borderLeft: `4px solid ${personColor(icIndex)}` }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-heading font-semibold text-sm truncate">{ic.icName || 'Unnamed'}</div>
        <div className="text-xs text-muted-foreground truncate mt-0.5">{ic.icRole || 'No role set'}</div>
      </div>
      {hasUtil && !confirmingDelete && (
        <div
          className="text-sm font-bold tabular-nums shrink-0"
          style={{ color: utilization === 0 ? '#9ca3af' : STATUS_COLORS[status] || '#000' }}
        >
          {utilization.toFixed(0)}%
        </div>
      )}
      {confirmingDelete ? (
        <Button variant="destructive" size="sm" className="shrink-0 h-7 px-2 text-xs" onClick={handleDeleteClick}>
          Confirm?
        </Button>
      ) : (
        <button
          type="button"
          className="shrink-0 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={handleDeleteClick}
          title="Delete member"
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} size={14} />
        </button>
      )}
    </div>
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

const WEEK_OPTIONS = [
  ...Array.from({ length: 13 }, (_, i) => ({ value: String(i + 1), label: `${i + 1} week${i > 0 ? 's' : ''}` })),
  { value: 'custom', label: 'Custom (date range)' }
];

const EditHistoryProjectDialog = ({ project, domainName, onClose, onSave }) => {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (project) {
      setDraft({
        title: project.title || '',
        startDate: project.startDate || null,
        weeksMode: project.weeksMode === 'custom' ? 'custom' : 'fixed',
        weeks: project.weeksMode === 'custom' ? 1 : (project.weeks || 1),
        customEndDate: project.customEndDate || null,
        allocationPercent: project.allocationPercent ?? 100,
        storyPoints: project.storyPoints ?? null,
      });
    } else {
      setDraft(null);
    }
  }, [project]);

  if (!project || !draft) return null;

  const durationValue = draft.weeksMode === 'custom' ? 'custom' : String(draft.weeks);
  const calculatedWeeks = getProjectWeeks(draft);

  const handleSave = () => {
    onSave(project.id, {
      title: draft.title,
      startDate: draft.startDate,
      weeksMode: draft.weeksMode,
      weeks: draft.weeksMode === 'fixed' ? draft.weeks : project.weeks,
      customEndDate: draft.weeksMode === 'custom' ? draft.customEndDate : null,
      allocationPercent: draft.allocationPercent,
      storyPoints: draft.storyPoints,
    });
    onClose();
  };

  return (
    <Dialog open={!!project} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Past Project</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {domainName && <p className="text-xs text-muted-foreground -mt-2">{domainName}</p>}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="history-project-title">Title</Label>
            <Input
              id="history-project-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[130px]">
              <label htmlFor="history-project-start" className="text-xs font-semibold block mb-1">Start Date</label>
              <input
                id="history-project-start"
                type="date"
                value={draft.startDate || ''}
                onChange={(e) => setDraft({ ...draft, startDate: e.target.value || null })}
                className="h-8 w-full rounded-md border border-input bg-input/20 px-2 text-xs/relaxed focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label htmlFor="history-project-duration" className="text-xs font-semibold block mb-1">Duration</label>
              <select
                id="history-project-duration"
                value={durationValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setDraft(value === 'custom'
                    ? { ...draft, weeksMode: 'custom' }
                    : { ...draft, weeksMode: 'fixed', weeks: Number(value) });
                }}
                className="h-8 w-full rounded-md border border-input bg-input/20 px-2 text-xs/relaxed focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                {WEEK_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {draft.weeksMode === 'custom' && (
              <div className="flex-1 min-w-[130px]">
                <label htmlFor="history-project-end" className="text-xs font-semibold block mb-1">End Date</label>
                <input
                  id="history-project-end"
                  type="date"
                  value={draft.customEndDate || ''}
                  onChange={(e) => setDraft({ ...draft, customEndDate: e.target.value || null })}
                  className="h-8 w-full rounded-md border border-input bg-input/20 px-2 text-xs/relaxed focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="history-project-allocation" className="text-xs">Allocation %</Label>
              <Input
                id="history-project-allocation"
                type="number"
                min="0"
                max="100"
                step="5"
                value={draft.allocationPercent}
                onChange={(e) => setDraft({ ...draft, allocationPercent: Number(e.target.value) || 100 })}
                className="h-8"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="history-project-points" className="text-xs">Story Pts</Label>
              <Input
                id="history-project-points"
                type="number"
                min="0"
                step="1"
                value={draft.storyPoints || ''}
                onChange={(e) => setDraft({ ...draft, storyPoints: e.target.value ? Number(e.target.value) : null })}
                className="h-8"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {draft.weeksMode === 'custom' && calculatedWeeks === 0
              ? 'Select start and end dates to calculate weeks'
              : `${calculatedWeeks}w @ ${draft.allocationPercent}% allocation`}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MemberDetailPanel = ({ ic, icIndex, onEdit, onDelete }) => {
  const { calculateResults, setActiveIC, updateIC } = useCapacity();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [view, setView] = useState('plan');
  const [editingHistoryProjectId, setEditingHistoryProjectId] = useState(null);

  useEffect(() => {
    setView('plan');
  }, [ic?.id]);

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
  const historyGroups = groupPastProjects(calculated?.pastProjects);

  const currentPeriod = getCurrentFiscalPeriod();
  // Historical time-off/availability isn't tracked per past quarter — only the IC's current
  // totalWeeksAvailable snapshot exists — so past-quarter utilization % approximates using
  // today's available-weeks figure applied retroactively.
  const toPercent = (weeks) =>
    typeof totalAvailable === 'number' && totalAvailable > 0 ? (weeks / totalAvailable) * 100 : 0;
  const capacityTrend = currentPeriod
    ? ['Q1', 'Q2', 'Q3', 'Q4']
        .slice(0, QUARTER_ORDER[currentPeriod.quarter])
        .map(q => {
          const group = historyGroups.find(g => g.quarter === q && g.fiscalYear === currentPeriod.fiscalYear);
          const weeks = group ? group.projects.reduce((sum, p) => sum + p.capacity, 0) : 0;
          return { label: q, weeks, percent: toPercent(weeks) };
        })
        .concat([{
          label: currentPeriod.quarter,
          weeks: totalPlanned ?? 0,
          percent: typeof utilization === 'number' && isFinite(utilization) ? utilization : toPercent(totalPlanned ?? 0),
          isCurrent: true,
        }])
    : [];

  const hasUtil = typeof utilization === 'number' && isFinite(utilization);
  const utilizationColor = !hasUtil || utilization === 0
    ? '#9ca3af'
    : STATUS_COLORS[status] || '#000';

  const color = personColor(icIndex);

  const rawEditingProject = editingHistoryProjectId
    ? ic.domains.flatMap(d => d.projects.map(p => ({ ...p, __domainName: d.name }))).find(p => p.id === editingHistoryProjectId)
    : null;

  const handleSaveHistoryProject = (projectId, updates) => {
    const updatedDomains = ic.domains.map(d => ({
      ...d,
      projects: (d.projects || []).map(p => p.id === projectId ? { ...p, ...updates } : p),
    }));
    updateIC(ic.id, { domains: updatedDomains });
  };

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
          {view === 'history' ? (
            <Button variant="outline" size="sm" onClick={() => setView('plan')}>Back</Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setView('history')}>History</Button>
              <Button variant="outline" size="sm" onClick={() => { setActiveIC(ic.id); setSummaryOpen(true); }}>
                View Summary
              </Button>
              <Button variant="outline" size="sm" onClick={onEdit}>Edit Plan</Button>
              {confirmingDelete ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onBlur={() => setConfirmingDelete(false)}
                  onClick={() => onDelete(ic.id)}
                  autoFocus
                >
                  Confirm Delete?
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(true)}>Delete</Button>
              )}
            </>
          )}
        </div>
      </div>

      <FormattedOutput open={summaryOpen} onClose={() => setSummaryOpen(false)} />

      <EditHistoryProjectDialog
        project={rawEditingProject}
        domainName={rawEditingProject?.__domainName}
        onClose={() => setEditingHistoryProjectId(null)}
        onSave={handleSaveHistoryProject}
      />

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

      {view === 'history' ? (
        <div>
          {/* Capacity over time */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Capacity Over Time
            </h3>
            <CapacityLineChart points={capacityTrend} />
          </div>

          {/* Project History */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Project History
            </h3>
            {historyGroups.length > 0 ? (
              <div className="space-y-3">
                {historyGroups.map(group => {
                  const groupTotal = group.projects.reduce((sum, p) => sum + p.capacity, 0);
                  return (
                    <div key={group.label} className="border border-border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
                        <span className="font-semibold text-sm">{group.label}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{groupTotal.toFixed(1)}w</span>
                      </div>
                      <div className="divide-y divide-border/60">
                        {group.projects.map(project => (
                          <div key={project.id} className="flex items-center justify-between px-3 py-2 text-sm">
                            <span className="truncate mr-3">
                              <span className="text-muted-foreground">{project.domainName}</span>
                              {project.domainName ? ' · ' : ''}
                              {project.title || 'Untitled'}
                            </span>
                            <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                              {project.startDate && <span>{project.startDate}</span>}
                              <span className="font-medium text-foreground tabular-nums">{project.capacity.toFixed(1)}w</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                aria-label="Edit project"
                                onClick={() => setEditingHistoryProjectId(project.id)}
                              >
                                <HugeiconsIcon icon={Edit02Icon} size={14} strokeWidth={2} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No past projects yet</p>
            )}
          </div>
        </div>
      ) : (
      <>
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
                  {(() => {
                    const visibleProjects = rawProjects
                      .map((project, pi) => ({ project, pi }))
                      .filter(({ pi }) => !effort.projects[pi]?.isPast);

                    return visibleProjects.length > 0 ? (
                      <div className="divide-y divide-border/60">
                        {visibleProjects.map(({ project, pi }) => {
                          const projectWeeks = effort.projects[pi]?.capacity ?? 0;
                          const inQuarter = effort.projects[pi]?.inQuarter ?? true;
                          return (
                            <div key={project.id} className={`flex items-center justify-between px-3 py-2 text-sm ${inQuarter ? '' : 'opacity-50'}`}>
                              <span className="truncate mr-3">{project.title || 'Untitled'}</span>
                              <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                                {project.startDate && <span>{project.startDate}</span>}
                                {!inQuarter && (
                                  <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Out of quarter</span>
                                )}
                                <span className="font-medium text-foreground tabular-nums">{projectWeeks}w</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="px-3 py-2 text-xs text-muted-foreground italic">No projects</p>
                    );
                  })()}
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
      </>
      )}
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
        <div className="grid grid-cols-1 min-[1100px]:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6 items-start">
          <div className="min-w-0">
            <ICInfoForm />
            <TimeOffForm />
          </div>
          <div className="min-w-0">
            <DomainList />
          </div>
        </div>
      </div>
    </div>
  );
};

const MemberListView = () => {
  const { ics, deleteIC } = useCapacity();
  const [selectedId, setSelectedId] = useState(ics[0]?.id ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleDeleteMember = (id) => {
    deleteIC(id);
    setIsEditing(false);
  };

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
      <div className={`shrink-0 border-r border-border flex flex-col ${collapsed ? 'w-10' : 'w-72'}`}>
        <button
          type="button"
          className="shrink-0 flex items-center justify-center h-9 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-b border-border"
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? 'Expand member list' : 'Collapse member list'}
        >
          <HugeiconsIcon icon={PanelLeftIcon} strokeWidth={2} size={16} />
        </button>
        {!collapsed && (
          <div className="overflow-y-auto">
            {ics.map((ic, i) => (
              <MemberListItem
                key={ic.id}
                ic={ic}
                icIndex={i}
                isSelected={ic.id === selectedId}
                onClick={() => handleSelectMember(ic.id)}
                onDelete={handleDeleteMember}
              />
            ))}
          </div>
        )}
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
            onDelete={handleDeleteMember}
          />
        )}
      </div>
    </div>
  );
};

export default MemberListView;
