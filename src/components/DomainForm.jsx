import React, { useState } from 'react';
import { KdsButton, KdsIconTrash, MxInputTextBox, MxDatePicker } from 'react-mx-web-components';
import { MxModal, MxModalBody } from 'react-mx-web-components';
import { v4 as uuidv4 } from 'uuid';
import { useCapacity } from '../context/CapacityContext';
import { getProjectWeeks } from '../utils/calculations';

const WEEK_OPTIONS = [
  ...Array.from({ length: 13 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} week${i > 0 ? 's' : ''}`
  })),
  { value: 'custom', label: 'Custom (date range)' }
];

const ProjectRow = ({ project, onUpdate, onRemove }) => {
  const weeksValue = project.weeksMode === 'custom' ? 'custom' : String(project.weeks || 1);
  const calculatedWeeks = getProjectWeeks(project);

  const handleStartDateChange = (e) => {
    const date = e.detail;
    const iso = date ? date.toISOString().split('T')[0] : null;
    onUpdate(project.id, { startDate: iso });
  };

  const handleEndDateChange = (e) => {
    const date = e.detail;
    const iso = date ? date.toISOString().split('T')[0] : null;
    onUpdate(project.id, { customEndDate: iso });
  };

  const handleWeeksChange = (value) => {
    if (value === 'custom') {
      onUpdate(project.id, { weeksMode: 'custom' });
    } else {
      onUpdate(project.id, { weeksMode: 'fixed', weeks: Number(value) });
    }
  };

  return (
    <div className="project-item">
      <div className="project-item-header">
        <span className="project-item-label">Project</span>
        <KdsButton
          palette="negative"
          kind="subtle"
          variant="minimal"
          onClick={() => onRemove(project.id)}
          aria-label="Remove project"
        >
          <KdsIconTrash size="s" />
        </KdsButton>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <MxInputTextBox
          label="Title"
          placeholder="Project title"
          value={project.title || ''}
          onChange={(e) => onUpdate(project.id, { title: e.target.value })}
          mask="none"
          isClearable={false}
        />
      </div>

      <div className="project-item-fields">
        <div className="project-field">
          <MxDatePicker
            label="Start Date"
            value={project.startDate || ''}
            onDateChanged={handleStartDateChange}
          />
        </div>
        <div className="project-field">
          <label className="project-field-label">Duration</label>
          <select
            value={weeksValue}
            onChange={(e) => handleWeeksChange(e.target.value)}
            className="project-weeks-select"
          >
            {WEEK_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {project.weeksMode === 'custom' && (
          <div className="project-field">
            <MxDatePicker
              label="End Date"
              value={project.customEndDate || ''}
              onDateChanged={handleEndDateChange}
            />
          </div>
        )}
      </div>

      {project.weeksMode === 'custom' && (
        <div className="project-custom-weeks">
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
      customEndDate: null
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
      <div className="kds-Card kds-Card--m kds-card-section">
        <div className="domain-header">
          <h2 className="kds-Heading kds-Heading--s" style={{ margin: 0 }}>Domain</h2>
          <KdsButton
            palette="negative"
            kind="subtle"
            variant="minimal"
            onClick={() => setDeleteDialogOpen(true)}
            aria-label="Remove domain"
          >
            <KdsIconTrash size="s" />
          </KdsButton>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <MxInputTextBox
            label="Domain Name"
            placeholder="e.g., TEST"
            value={domain.name}
            onChange={(e) => updateDomain({ name: e.target.value })}
            mask="none"
            isClearable={false}
          />
        </div>

        <div className="project-list">
          {(domain.projects || []).map(project => (
            <ProjectRow
              key={project.id}
              project={project}
              onUpdate={handleProjectUpdate}
              onRemove={handleProjectRemove}
            />
          ))}
        </div>

        <KdsButton
          kind="secondary"
          style={{ width: '100%', marginTop: '0.5rem' }}
          onClick={handleAddProject}
        >
          + Add Project
        </KdsButton>

        <div className="summary-box">
          <span>Domain total: <strong>{totalWeeks.toFixed(1)} weeks</strong></span>
        </div>
      </div>

      <MxModal
        isOpened={deleteDialogOpen}
        headercontent="Remove Domain"
        footerPrimaryButtonText="Remove"
        footerPrimaryButtonKind="destructive"
        footerSecondaryButtonText="Cancel"
        closeOnSecondaryButton
        onApplyClick={handleRemoveConfirm}
        onSecondaryClick={() => setDeleteDialogOpen(false)}
        onModalClose={() => setDeleteDialogOpen(false)}
      >
        <MxModalBody>
          Remove domain "{domain.name || 'Untitled'}"?
        </MxModalBody>
      </MxModal>
    </>
  );
};

export default DomainForm;
