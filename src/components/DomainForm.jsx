import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { v4 as uuidv4 } from 'uuid';
import { useCapacity } from '../context/CapacityContext';
import { getProjectWeeks } from '../utils/calculations';
import SupportNeedsSelector from './SupportNeedsSelector';

const WEEK_OPTIONS = [
  ...Array.from({ length: 13 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} week${i > 0 ? 's' : ''}`
  })),
  { value: 'custom', label: 'Custom (date range)' }
];

const DateField = ({ label, value, onChange }) => (
  <div className="flex-1 min-w-[130px]">
    <label className="text-xs font-semibold block mb-1">{label}</label>
    <input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-xs/relaxed focus:outline-none focus:ring-2 focus:ring-ring/30"
    />
  </div>
);

const ProjectRow = ({ project, onUpdate, onRemove }) => {
  const weeksValue = project.weeksMode === 'custom' ? 'custom' : String(project.weeks || 1);
  const calculatedWeeks = getProjectWeeks(project);

  const handleWeeksChange = (value) => {
    if (value === 'custom') {
      onUpdate(project.id, { weeksMode: 'custom' });
    } else {
      onUpdate(project.id, { weeksMode: 'fixed', weeks: Number(value) });
    }
  };

  return (
    <div className="bg-muted/30 border border-border rounded-md p-3 mb-2">
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
        <Label>Title</Label>
        <Input
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
        />
        <div className="flex-1 min-w-[130px]">
          <label className="text-xs font-semibold block mb-1">Duration</label>
          <select
            value={weeksValue}
            onChange={(e) => handleWeeksChange(e.target.value)}
            className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-xs/relaxed focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            {WEEK_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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
          />
        )}
      </div>

      {project.weeksMode === 'custom' && (
        <div className="mt-2 text-xs text-muted-foreground">
          {calculatedWeeks > 0
            ? `${calculatedWeeks} week${calculatedWeeks !== 1 ? 's' : ''}`
            : 'Select start and end dates to calculate weeks'}
        </div>
      )}
    </div>
  );
};

const DomainForm = ({ domain }) => {
  const { activeIC, updateIC } = useCapacity();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!activeIC) return null;

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
      supportNeeds: []
    };
    updateDomain({ projects: [...(domain.projects || []), newProject] });
  };

  const handleRemoveConfirm = () => {
    const updatedDomains = activeIC.domains.filter(d => d.id !== domain.id);
    updateIC(activeIC.id, { domains: updatedDomains });
    setDeleteDialogOpen(false);
  };

  const totalWeeks = (domain.projects || []).reduce((sum, p) => sum + getProjectWeeks(p), 0);

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
          <Label>Domain Name</Label>
          <Input
            placeholder="e.g., TEST"
            value={domain.name}
            onChange={(e) => updateDomain({ name: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-0">
          {(domain.projects || []).map(project => (
            <ProjectRow
              key={project.id}
              project={project}
              onUpdate={handleProjectUpdate}
              onRemove={handleProjectRemove}
            />
          ))}
        </div>

        <Button variant="outline" className="w-full mt-2" onClick={handleAddProject}>
          + Add Project
        </Button>

        <div className="mt-4 p-3 bg-muted rounded-md">
          <span>Domain total: <strong>{totalWeeks.toFixed(1)} weeks</strong></span>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && setDeleteDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Domain</DialogTitle>
          </DialogHeader>
          <p>Remove domain "{domain.name || 'Untitled'}"?</p>
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
