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
        <button type="button" className="inline-flex items-center justify-center ml-1.5 p-0 bg-transparent border-none cursor-pointer text-muted-foreground">
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
    updateIC(activeIC.id, { timeOff: { ...activeIC.timeOff, devDays: value } });
  };

  const handleHolidayChange = (e) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    updateIC(activeIC.id, { timeOff: { ...activeIC.timeOff, holidayDays: value } });
  };

  const calculated = calculateResults(activeIC);
  const totalTimeOff = calculated ? formatWeeksAndDays(calculated.totalTimeOffWeeks) : '0 days';

  return (
    <div className="mb-4 p-6 bg-card rounded-lg border">
      <h2 className="mb-4 text-base font-bold">Quarterly Planning</h2>

      <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 max-[768px]:grid-cols-1">
        {/* OKR Time */}
        <div>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <div className="flex items-center mb-1.5">
                <label className="text-xs font-semibold">OKR Time</label>
                <InfoTooltip content="Provide the time spent during OKR Planning with your team." />
              </div>
              <div onKeyDown={allowNumericOnly}>
                <Input value={String(activeIC.timeOff.okrTime.value)} onChange={handleOKRValueChange} />
              </div>
            </div>
            <fieldset className="border-none p-0 m-0 pb-0.5">
              <RadioGroup
                value={activeIC.timeOff.okrTime.unit}
                onValueChange={(unit) => updateIC(activeIC.id, {
                  timeOff: { ...activeIC.timeOff, okrTime: { ...activeIC.timeOff.okrTime, unit } }
                })}
                className="flex gap-4 items-center"
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

        {/* Dev / L&D Days */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center">
            <label className="text-xs font-semibold">Dev / L&amp;D Days</label>
            <InfoTooltip content="KTD provides Learning and Development days for FTE Associates only. Provide the number of days you will use during the quarter" />
          </div>
          <div onKeyDown={allowNumericOnly}>
            <Input value={String(activeIC.timeOff.devDays)} onChange={handleDevChange} />
          </div>
        </div>

        {/* Holiday Days */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center">
            <label className="text-xs font-semibold">Holiday Days</label>
            <InfoTooltip content="Provide the number of Holidays during the quarter." />
          </div>
          <div onKeyDown={allowNumericOnly}>
            <Input value={String(activeIC.timeOff.holidayDays)} onChange={handleHolidayChange} />
          </div>
        </div>
      </div>

      <PTOScheduling />

      <div className="mt-4 p-3 bg-muted rounded-md">
        <span>Total time off: <strong>{totalTimeOff}</strong></span>
      </div>
    </div>
  );
};

export default TimeOffForm;
