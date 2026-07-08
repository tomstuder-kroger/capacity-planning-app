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
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>← Back to Team</Button>
      </div>

      <QuarterInfoForm />

      <div className="grid grid-cols-[7fr_5fr] gap-6 items-start max-[900px]:grid-cols-1">
        <div>
          <TimeOffForm />
          <DomainList />
        </div>
        <div>
          <CapacityDashboard />
        </div>
      </div>
    </div>
  );
};

export default PlanningView;
