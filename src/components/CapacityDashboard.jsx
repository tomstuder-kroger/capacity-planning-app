import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HugeiconsIcon } from '@hugeicons/react';
import { EyeIcon } from '@hugeicons/core-free-icons';
import { useCapacity } from '../context/CapacityContext';
import FormattedOutput from './FormattedOutput';
import SupportNeedsDashboard from './SupportNeedsDashboard';

const CapacityDashboard = () => {
  const { activeIC, calculateResults } = useCapacity();
  const [summaryOpen, setSummaryOpen] = useState(false);

  if (!activeIC) {
    return (
      <div className="kds-Card kds-Card--m kds-card-section" style={{ textAlign: 'center' }}>
        <span style={{ color: '#6b7280' }}>Create an IC to see capacity dashboard</span>
      </div>
    );
  }

  const calculated = calculateResults(activeIC);

  if (!calculated) return null;

  const {
    totalWeeksAvailable,
    totalPlannedWork,
    capacityUtilization,
    overUnderCapacity,
    status
  } = calculated;

  const getStatusColor = () => {
    if (capacityUtilization === 0) return '#9ca3af';
    if (status === 'over') return '#d32f2f';
    return '#2e7d32';
  };

  const getStatusLabel = () => {
    if (status === 'over') return 'Over Capacity';
    if (status === 'fully') return 'Fully Allocated';
    return 'Under Capacity';
  };

  const getOverUnderText = () => {
    if (overUnderCapacity > 0) {
      return `Over by ${Math.abs(overUnderCapacity).toFixed(1)}w`;
    } else if (overUnderCapacity < 0) {
      return `Under by ${Math.abs(overUnderCapacity).toFixed(1)}w`;
    }
    return 'Fully allocated';
  };

  const utilizationValue = Math.min(capacityUtilization, 200);
  const showInfinityWarning = !isFinite(capacityUtilization);

  const totalProjects = activeIC.domains.reduce((sum, d) => sum + (d.projects ? d.projects.length : 0), 0);

  const statusBadgeVariant = status === 'over' ? 'destructive' : 'default';
  const statusBadgeClass = status !== 'over' ? 'bg-success/15 text-success border-success/20 hover:bg-success/20' : '';

  return (
    <>
      <div className="kds-Card kds-Card--m kds-card-section">
        <h2 className="kds-Heading kds-Heading--s section-heading">Capacity Status</h2>

        {showInfinityWarning ? (
          <Alert className="mb-4 border-warning/30 bg-warning/10 text-warning-foreground">
            <AlertDescription>Cannot calculate utilization - no available time</AlertDescription>
          </Alert>
        ) : (
          <div className="utilization-display">
            <div className="utilization-percent" style={{ color: getStatusColor() }}>
              {capacityUtilization.toFixed(0)}%
            </div>
            <div style={{ color: getStatusColor(), marginTop: '0.25rem' }}>
              {getStatusLabel()}
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${(utilizationValue / 200) * 100}%`,
                  backgroundColor: getStatusColor()
                }}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          <div className="stat-row">
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Available:</span>
            <strong style={{ fontSize: '0.875rem' }}>{totalWeeksAvailable.toFixed(1)}w</strong>
          </div>
          <div className="stat-row">
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Planned:</span>
            <strong style={{ fontSize: '0.875rem' }}>{totalPlannedWork.toFixed(1)}w</strong>
          </div>
          <div className="stat-row">
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Difference:</span>
            <strong style={{ fontSize: '0.875rem', color: getStatusColor() }}>{getOverUnderText()}</strong>
          </div>
        </div>

        <div className="tag-row">
          <Badge variant={statusBadgeVariant} className={statusBadgeClass}>
            {activeIC.domains.length} Domain(s)
          </Badge>
          {totalProjects > 0 && (
            <Badge variant="secondary">{totalProjects} Project(s)</Badge>
          )}
        </div>

        <Button className="w-full" style={{ marginTop: '1rem' }} onClick={() => setSummaryOpen(true)}>
          <HugeiconsIcon icon={EyeIcon} strokeWidth={2} data-icon="inline-start" />
          View Summary
        </Button>
      </div>

      <SupportNeedsDashboard />

      <FormattedOutput open={summaryOpen} onClose={() => setSummaryOpen(false)} />
    </>
  );
};

export default CapacityDashboard;
