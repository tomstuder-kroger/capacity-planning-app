import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { v4 as uuidv4 } from 'uuid';
import { useCapacity } from '../context/CapacityContext';
import { getProjectWeeks, calculateProjectCapacity, isProjectPast } from '../utils/calculations';
import SupportNeedsSelector from './SupportNeedsSelector';

const WEEK_OPTIONS = [
  ...Array.from({ length: 13 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} week${i > 0 ? 's' : ''}`
  })),
  { value: 'custom', label: 'Custom (date range)' }
];

const DateField = ({ label, value, onChange, id }) => (
  <div className="flex-1 min-w-[130px]">
    <label htmlFor={id} className="text-xs font-semibold block mb-1">{label}</label>
    <input
      id={id}
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-xs/relaxed focus:outline-none focus:ring-2 focus:ring-ring/30"
    />
  </div>
);

const ProjectRow = ({ project, onUpdate, onRemove, movingToHistory }) => {
  const weeksValue = project.weeksMode === 'custom' ? 'custom' : String(project.weeks || 1);
  const calculatedWeeks = getProjectWeeks(project);
  const allocation = project.allocationPercent ?? 100;
  const capacityConsumed = calculateProjectCapacity(project);

  const handleWeeksChange = (value) => {
    if (value === 'custom') {
      onUpdate(project.id, { weeksMode: 'custom' });
    } else {
      onUpdate(project.id, { weeksMode: 'fixed', weeks: Number(value) });
    }
  };

  return (
    <div className="border border-border rounded-md p-3 mb-2">
      {movingToHistory && (
        <div className="mb-2 text-xs rounded-md bg-amber-100 text-amber-900 px-2 py-1.5 border border-amber-200">
          These dates now fall in a past quarter — moving to History.
        </div>
      )}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</span>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onRemove(project.id)}
          aria-label="Remove project"
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
        </Button>
      </div>

      <div className="flex flex-col gap-1.5 mb-3">
        <Label htmlFor={`project-title-${project.id}`}>Title</Label>
        <Input
          id={`project-title-${project.id}`}
          placeholder="Project title"
          value={project.title || ''}
          onChange={(e) => onUpdate(project.id, { title: e.target.value })}
        />
      </div>

      <div className="flex gap-3 items-start flex-wrap">
        <DateField
          label="Start Date"
          value={project.startDate}
          onChange={(iso) => onUpdate(project.id, { startDate: iso })}
          id={`start-date-${project.id}`}
        />
        <div className="flex-1 min-w-[130px]">
          <label htmlFor={`project-duration-${project.id}`} className="text-xs font-semibold block mb-1">Duration</label>
          <select
            id={`project-duration-${project.id}`}
            value={weeksValue}
            onChange={(e) => handleWeeksChange(e.target.value)}
            className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-xs/relaxed focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            {WEEK_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[100px]">
          <Label htmlFor={`allocation-${project.id}`} className="text-xs">
            Allocation %
          </Label>
          <Input
            id={`allocation-${project.id}`}
            type="number"
            min="0"
            max="100"
            step="5"
            placeholder="100"
            value={allocation}
            onChange={(e) => onUpdate(project.id, {
              allocationPercent: Number(e.target.value) || 100
            })}
            className="h-7"
          />
        </div>
        <div className="flex-1 min-w-[90px]">
          <Label htmlFor={`story-points-${project.id}`} className="text-xs">
            Story Pts
          </Label>
          <Input
            id={`story-points-${project.id}`}
            type="number"
            min="0"
            step="1"
            placeholder="—"
            value={project.storyPoints || ''}
            onChange={(e) => onUpdate(project.id, {
              storyPoints: e.target.value ? Number(e.target.value) : null
            })}
            className="h-7"
          />
        </div>
        <SupportNeedsSelector
          value={project.supportNeeds || []}
          onChange={(selected) => onUpdate(project.id, { supportNeeds: selected })}
        />
        {project.weeksMode === 'custom' && (
          <DateField
            label="End Date"
            value={project.customEndDate}
            onChange={(iso) => onUpdate(project.id, { customEndDate: iso })}
            id={`end-date-${project.id}`}
          />
        )}
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        {project.weeksMode === 'custom' && calculatedWeeks === 0
          ? 'Select start and end dates to calculate weeks'
          : `${calculatedWeeks}w @ ${allocation}% = ${capacityConsumed.toFixed(1)}w capacity`}
      </div>
    </div>
  );
};

const MOVED_TO_HISTORY_NOTICE_MS = 3000;

const DomainForm = ({ domain, quarterRange }) => {
  const { activeIC, updateIC } = useCapacity();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movingToHistoryIds, setMovingToHistoryIds] = useState(new Set());
  const wasPastRef = useRef(new Map());
  const timersRef = useRef(new Map());

  const allProjects = domain.projects || [];

  // Completed work from prior quarters is edited from the History view instead —
  // the plan editor should only reflect what's currently in flight. When an edit
  // pushes a project's dates into the past, show a brief notice before it moves
  // out of view instead of having it vanish with no explanation.
  useEffect(() => {
    setMovingToHistoryIds(prev => {
      let changed = false;
      const next = new Set(prev);

      allProjects.forEach(p => {
        const isPast = isProjectPast(p, quarterRange);
        const wasPast = wasPastRef.current.get(p.id) ?? false;

        if (isPast && !wasPast) {
          next.add(p.id);
          changed = true;
          const timer = setTimeout(() => {
            setMovingToHistoryIds(curr => {
              if (!curr.has(p.id)) return curr;
              const updated = new Set(curr);
              updated.delete(p.id);
              return updated;
            });
            timersRef.current.delete(p.id);
          }, MOVED_TO_HISTORY_NOTICE_MS);
          timersRef.current.set(p.id, timer);
        } else if (!isPast) {
          if (next.has(p.id)) {
            next.delete(p.id);
            changed = true;
          }
          const existingTimer = timersRef.current.get(p.id);
          if (existingTimer) {
            clearTimeout(existingTimer);
            timersRef.current.delete(p.id);
          }
        }

        wasPastRef.current.set(p.id, isPast);
      });

      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProjects, quarterRange]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  if (!activeIC) return null;

  const currentProjects = allProjects.filter(p =>
    !isProjectPast(p, quarterRange) || movingToHistoryIds.has(p.id)
  );

  const updateDomain = (updates) => {
    const updatedDomains = activeIC.domains.map(d =>
      d.id === domain.id ? { ...d, ...updates } : d
    );
    updateIC(activeIC.id, { domains: updatedDomains });
  };

  const handleProjectUpdate = (projectId, updates) => {
    const updatedProjects = (domain.projects || []).map(p =>
      p.id === projectId ? { ...p, ...updates } : p
    );
    updateDomain({ projects: updatedProjects });
  };

  const handleProjectRemove = (projectId) => {
    const updatedProjects = (domain.projects || []).filter(p => p.id !== projectId);
    updateDomain({ projects: updatedProjects });
  };

  const handleAddProject = () => {
    const newProject = {
      id: uuidv4(),
      title: '',
      startDate: null,
      weeksMode: 'fixed',
      weeks: 1,
      customEndDate: null,
      supportNeeds: [],
      allocationPercent: 100,
      storyPoints: null
    };
    updateDomain({ projects: [...(domain.projects || []), newProject] });
  };

  const handleRemoveConfirm = () => {
    const updatedDomains = activeIC.domains.filter(d => d.id !== domain.id);
    updateIC(activeIC.id, { domains: updatedDomains });
    setDeleteDialogOpen(false);
  };

  const totalCapacity = currentProjects.reduce((sum, p) => {
    const weeks = getProjectWeeks(p);
    const allocation = (p.allocationPercent ?? 100) / 100;
    return sum + (weeks * allocation);
  }, 0);

  return (
    <>
      <div className="mb-4 p-6 bg-card rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold">Domain</h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteDialogOpen(true)}
            aria-label="Remove domain"
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          </Button>
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <Label htmlFor={`domain-name-${domain.id}`}>Domain Name</Label>
          <Input
            id={`domain-name-${domain.id}`}
            placeholder="e.g., TEST"
            value={domain.name}
            onChange={(e) => updateDomain({ name: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-0">
          {currentProjects.map(project => (
            <ProjectRow
              key={project.id}
              project={project}
              onUpdate={handleProjectUpdate}
              onRemove={handleProjectRemove}
              movingToHistory={movingToHistoryIds.has(project.id)}
            />
          ))}
        </div>
        {currentProjects.length === 0 && (domain.projects || []).length > 0 && (
          <p className="text-xs text-muted-foreground italic mb-2">
            All work in this domain is from a past quarter — view or edit it from History.
          </p>
        )}

        <Button variant="outline" className="w-full mt-2" onClick={handleAddProject}>
          + Add Project
        </Button>

        <div className="mt-4 p-3 bg-muted rounded-md">
          <span>Total capacity: <strong>{totalCapacity.toFixed(1)} weeks</strong></span>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && setDeleteDialogOpen(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Domain</DialogTitle>
          </DialogHeader>
          <DialogDescription>Remove domain "{domain.name || 'Untitled'}"?</DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveConfirm}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DomainForm;
