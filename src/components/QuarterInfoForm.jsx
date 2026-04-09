import React, { useEffect } from 'react';
import { useCapacity } from '../context/CapacityContext';
import { getCurrentFiscalPeriod } from '../utils/fiscalCalendar';

const currentPeriod = getCurrentFiscalPeriod();

const QuarterInfoForm = () => {
  const { activeIC, updateIC } = useCapacity();

  // Must be before any early return — rules of hooks
  useEffect(() => {
    if (!activeIC || !currentPeriod) return;
    const quarter = `${currentPeriod.quarter} ${currentPeriod.fiscalYear}`;
    if (activeIC.weeksInQuarter !== currentPeriod.weeksInQuarter || activeIC.quarter !== quarter) {
      updateIC(activeIC.id, {
        quarter,
        weeksInQuarter: currentPeriod.weeksInQuarter,
      });
    }
  }, [activeIC?.id]);

  if (!activeIC) return null;

  return (
    <div className="kds-Card kds-Card--m kds-card-section" style={{ background: 'linear-gradient(135deg, #e8f0fe 0%, #dbeafe 100%)', border: '1.5px solid #0F52A2', boxShadow: '0 2px 8px rgba(15, 82, 162, 0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
            {activeIC.icName || 'Unnamed'}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '2px' }}>
            {activeIC.icRole || ''}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Quarter
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif', lineHeight: 1 }}>
                {currentPeriod ? currentPeriod.quarter : '—'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>Quarter</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif', lineHeight: 1 }}>
                {currentPeriod ? `FY${currentPeriod.fiscalYear}` : '—'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>Fiscal Year</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif', lineHeight: 1 }}>
                {currentPeriod ? `${currentPeriod.weeksInQuarter}w` : '—'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>Weeks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuarterInfoForm;
