import React, { useState } from 'react';
import { KdsButton, KdsTag, KdsMessage, KdsIconEye } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';
import FormattedOutput from './FormattedOutput';

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
    if (status === 'over') return '#d32f2f';
    if (status === 'fully') return '#ed6c02';
    return '#2e7d32';
  };

  const getStatusKind = () => {
    if (status === 'over') return 'negative';
    if (status === 'fully') return 'callout';
    return 'positive';
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

  return (
    <>
      <div className="kds-Card kds-Card--m kds-card-section">
        <h2 className="kds-Heading kds-Heading--s section-heading">Capacity Status</h2>

        {showInfinityWarning ? (
          <KdsMessage kind="warning" style={{ marginBottom: '1rem' }}>
            Cannot calculate utilization - no available time
          </KdsMessage>
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
          <KdsTag kind={getStatusKind()}>{activeIC.domains.length} Domain(s)</KdsTag>
          {totalProjects > 0 && (
            <KdsTag kind="default">{totalProjects} Project(s)</KdsTag>
          )}
        </div>

        <KdsButton kind="primary" style={{ width: '100%' }} onClick={() => setSummaryOpen(true)}>
          <KdsIconEye /> View Summary
        </KdsButton>
      </div>

      <FormattedOutput open={summaryOpen} onClose={() => setSummaryOpen(false)} />
    </>
  );
};

export default CapacityDashboard;
