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
      <div className="mb-4 p-6 bg-card rounded-lg border text-center">
        <span className="text-muted-foreground">Create an IC to see capacity dashboard</span>
      </div>
    );
  }

  const calculated = calculateResults(activeIC);
  if (!calculated) return null;

  const { totalWeeksAvailable, totalPlannedWork, capacityUtilization, overUnderCapacity, status } = calculated;

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
    if (overUnderCapacity > 0) return `Over by ${Math.abs(overUnderCapacity).toFixed(1)}w`;
    if (overUnderCapacity < 0) return `Under by ${Math.abs(overUnderCapacity).toFixed(1)}w`;
    return 'Fully allocated';
  };

  const utilizationValue = Math.min(capacityUtilization, 200);
  const showInfinityWarning = !isFinite(capacityUtilization);

  const totalProjects = activeIC.domains.reduce((sum, d) => sum + (d.projects ? d.projects.length : 0), 0);
  const statusBadgeVariant = status === 'over' ? 'destructive' : 'default';
  const statusBadgeClass = status !== 'over' ? 'bg-success/15 text-success border-success/20 hover:bg-success/20' : '';

  return (
    <>
      <div className="mb-4 p-6 bg-card rounded-lg border">
        <h2 className="mb-4 text-base font-bold">Capacity Status</h2>

        {showInfinityWarning ? (
          <Alert className="mb-4 border-warning/30 bg-warning/10 text-warning-foreground">
            <AlertDescription>Cannot calculate utilization - no available time</AlertDescription>
          </Alert>
        ) : (
          <div className="flex flex-col items-center text-center my-6">
            <div className="text-6xl font-bold leading-none" style={{ color: getStatusColor() }}>
              {capacityUtilization.toFixed(0)}%
            </div>
            <div className="mt-1" style={{ color: getStatusColor() }}>
              {getStatusLabel()}
            </div>
            <div className="mt-3 w-full h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(utilizationValue / 200) * 100}%`, backgroundColor: getStatusColor() }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Available:</span>
            <strong className="text-sm">{totalWeeksAvailable.toFixed(1)}w</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Planned:</span>
            <strong className="text-sm">{totalPlannedWork.toFixed(1)}w</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Difference:</span>
            <strong className="text-sm" style={{ color: getStatusColor() }}>{getOverUnderText()}</strong>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={statusBadgeVariant} className={statusBadgeClass}>
            {activeIC.domains.length} Domain(s)
          </Badge>
          {totalProjects > 0 && (
            <Badge variant="secondary">{totalProjects} Project(s)</Badge>
          )}
        </div>

        <Button className="w-full mt-4" onClick={() => setSummaryOpen(true)}>
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
