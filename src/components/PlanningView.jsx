import React from 'react';
import { Button } from '@/components/ui/button';
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
        <Button variant="outline" onClick={onBack}>← Back to Team</Button>
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
