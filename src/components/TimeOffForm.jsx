import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon } from '@hugeicons/core-free-icons';
import { useCapacity } from '../context/CapacityContext';
import { formatWeeksAndDays } from '../utils/calculations';
import PTOScheduling from './PTOScheduling';

const InfoTooltip = ({ content }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginLeft: '0.35rem',
            background: 'none',
            border: 'none',
            padding: '0',
            color: '#6b7280',
          }}
        >
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} size={16} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{content}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const allowNumericOnly = (e) => {
  const allowed = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
  if (!allowed.includes(e.key)) e.preventDefault();
};

const TimeOffForm = () => {
  const { activeIC, updateIC, calculateResults } = useCapacity();

  if (!activeIC) return null;

  const handleOKRValueChange = (e) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    updateIC(activeIC.id, {
      timeOff: {
        ...activeIC.timeOff,
        okrTime: { ...activeIC.timeOff.okrTime, value }
      }
    });
  };

  const handleDevChange = (e) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    updateIC(activeIC.id, {
      timeOff: { ...activeIC.timeOff, devDays: value }
    });
  };

  const handleHolidayChange = (e) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    updateIC(activeIC.id, {
      timeOff: { ...activeIC.timeOff, holidayDays: value }
    });
  };

  const calculated = calculateResults(activeIC);
  const totalTimeOff = calculated ? formatWeeksAndDays(calculated.totalTimeOffWeeks) : '0 days';

  return (
    <div className="kds-Card kds-Card--m kds-card-section">
      <h2 className="kds-Heading kds-Heading--s section-heading">
        Quarterly Planning
      </h2>
      <div className="form-grid-timeoff">
        <div>
          <div className="okr-row">
            <div className="okr-input">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label className="kds-Label kds-Text--m" style={{ fontWeight: 700 }}>OKR Time</label>
                <InfoTooltip content="Provide the time spent during OKR Planning with your team." />
              </div>
              <div onKeyDown={allowNumericOnly}>
                <Input
                  value={String(activeIC.timeOff.okrTime.value)}
                  onChange={handleOKRValueChange}
                />
              </div>
            </div>
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <RadioGroup
                value={activeIC.timeOff.okrTime.unit}
                onValueChange={(unit) => updateIC(activeIC.id, {
                  timeOff: { ...activeIC.timeOff, okrTime: { ...activeIC.timeOff.okrTime, unit } }
                })}
                className="okr-units"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="days" id="okr-days" />
                  <Label htmlFor="okr-days">Days</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="weeks" id="okr-weeks" />
                  <Label htmlFor="okr-weeks">Weeks</Label>
                </div>
              </RadioGroup>
            </fieldset>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label className="kds-Label kds-Text--m" style={{ fontWeight: 700 }}>Dev / L&amp;D Days</label>
            <InfoTooltip content="KTD provides Learning and Development days for FTE Associates only. Provide the number of days you will use during the quarter" />
          </div>
          <div onKeyDown={allowNumericOnly}>
            <Input
              value={String(activeIC.timeOff.devDays)}
              onChange={handleDevChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label className="kds-Label kds-Text--m" style={{ fontWeight: 700 }}>Holiday Days</label>
            <InfoTooltip content="Provide the number of Holidays during the quarter." />
          </div>
          <div onKeyDown={allowNumericOnly}>
            <Input
              value={String(activeIC.timeOff.holidayDays)}
              onChange={handleHolidayChange}
            />
          </div>
        </div>
      </div>

      <PTOScheduling />

      <div className="summary-box">
        <span>Total time off: <strong>{totalTimeOff}</strong></span>
      </div>
    </div>
  );
};

export default TimeOffForm;
