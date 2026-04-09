import React from 'react';
import { KdsButton } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';
import QuarterInfoForm from './QuarterInfoForm';
import TimeOffForm from './TimeOffForm';
import DomainList from './DomainList';
import CapacityDashboard from './CapacityDashboard';

const PlanningView = ({ onBack }) => {
  const { activeIC } = useCapacity();

  return (
    <div>
      <div className="planning-header">
        <KdsButton kind="secondary" onClick={onBack}>← Back to Team</KdsButton>
      </div>

      <QuarterInfoForm />

      <div className="capacity-layout-grid">
        <div className="forms-column">
          <TimeOffForm />
          <DomainList />
        </div>
        <div className="dashboard-column">
          <CapacityDashboard />
        </div>
      </div>
    </div>
  );
};

export default PlanningView;
