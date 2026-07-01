import React, { useEffect } from 'react';
import { useCapacity } from '../context/CapacityContext';
import { getCurrentFiscalPeriod } from '../utils/fiscalCalendar';

const currentPeriod = getCurrentFiscalPeriod();

const QuarterInfoForm = () => {
  const { activeIC, updateIC } = useCapacity();

  useEffect(() => {
    if (!activeIC || !currentPeriod) return;
    const quarter = `${currentPeriod.quarter} ${currentPeriod.fiscalYear}`;
    if (activeIC.weeksInQuarter !== currentPeriod.weeksInQuarter || activeIC.quarter !== quarter) {
      updateIC(activeIC.id, {
        quarter,
        weeksInQuarter: currentPeriod.weeksInQuarter,
      });
    }
  }, [activeIC?.id, activeIC?.weeksInQuarter, activeIC?.quarter, updateIC]);

  if (!activeIC) return null;

  return (
    <div className="mb-4 p-6 rounded-lg border" style={{ background: 'rgb(239, 247, 253)', borderColor: 'rgb(15, 82, 162)' }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold font-sans leading-none">
            {activeIC.icName || 'Unnamed'}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">
            {activeIC.icRole || ''}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
            Current Quarter
          </div>
          <div className="flex gap-6 justify-end">
            <div className="text-center">
              <div className="text-2xl font-bold font-sans leading-none">
                {currentPeriod ? currentPeriod.quarter : '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Quarter</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-sans leading-none">
                {currentPeriod ? `FY${currentPeriod.fiscalYear}` : '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Fiscal Year</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-sans leading-none">
                {currentPeriod ? `${currentPeriod.weeksInQuarter}w` : '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Weeks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuarterInfoForm;
