import React from 'react';
import { KdsInput, KdsLabel, KdsRadio, KdsMessage } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';
import { validateNonNegativeNumber } from '../utils/validation';

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

  const handleOKRUnitChange = (e) => {
    updateIC(activeIC.id, {
      timeOff: {
        ...activeIC.timeOff,
        okrTime: { ...activeIC.timeOff.okrTime, unit: e.target.value }
      }
    });
  };

  const handlePTOChange = (e) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    updateIC(activeIC.id, {
      timeOff: { ...activeIC.timeOff, ptoDays: value }
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

  const okrError = validateNonNegativeNumber(activeIC.timeOff.okrTime.value);
  const ptoError = validateNonNegativeNumber(activeIC.timeOff.ptoDays);
  const devError = validateNonNegativeNumber(activeIC.timeOff.devDays);
  const holidayError = validateNonNegativeNumber(activeIC.timeOff.holidayDays);

  const calculated = calculateResults(activeIC);
  const totalTimeOff = calculated ? calculated.totalTimeOffWeeks.toFixed(1) : '0.0';

  return (
    <div className="kds-Card kds-Card--m kds-card-section">
      <h2 className="kds-Heading kds-Heading--s section-heading">Time Off</h2>
      <div className="form-grid-2col">
        <div>
          <KdsLabel>OKR Time</KdsLabel>
          <div className="okr-row">
            <div className="okr-input">
              <KdsInput
                type="number"
                value={activeIC.timeOff.okrTime.value}
                onChange={handleOKRValueChange}
                invalid={!!okrError}
                min={0}
                step={0.1}
              />
              {okrError && <KdsMessage kind="error">{okrError}</KdsMessage>}
            </div>
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <div className="okr-units">
                <KdsLabel leftOfInput>
                  <KdsRadio
                    name="okrUnit"
                    value="days"
                    checked={activeIC.timeOff.okrTime.unit === 'days'}
                    onChange={handleOKRUnitChange}
                  />
                  Days
                </KdsLabel>
                <KdsLabel leftOfInput>
                  <KdsRadio
                    name="okrUnit"
                    value="weeks"
                    checked={activeIC.timeOff.okrTime.unit === 'weeks'}
                    onChange={handleOKRUnitChange}
                  />
                  Weeks
                </KdsLabel>
              </div>
            </fieldset>
          </div>
        </div>

        <div>
          <KdsLabel>
            PTO Days
            <KdsInput
              type="number"
              value={activeIC.timeOff.ptoDays}
              onChange={handlePTOChange}
              invalid={!!ptoError}
              min={0}
              step={0.1}
            />
          </KdsLabel>
          {ptoError && <KdsMessage kind="error">{ptoError}</KdsMessage>}
        </div>

        <div>
          <KdsLabel>
            Dev / L&amp;D Days
            <KdsInput
              type="number"
              value={activeIC.timeOff.devDays}
              onChange={handleDevChange}
              invalid={!!devError}
              min={0}
              step={0.1}
            />
          </KdsLabel>
          {devError && <KdsMessage kind="error">{devError}</KdsMessage>}
        </div>

        <div>
          <KdsLabel>
            Holiday Days
            <KdsInput
              type="number"
              value={activeIC.timeOff.holidayDays}
              onChange={handleHolidayChange}
              invalid={!!holidayError}
              min={0}
              step={0.1}
            />
          </KdsLabel>
          {holidayError && <KdsMessage kind="error">{holidayError}</KdsMessage>}
        </div>
      </div>

      <div className="summary-box">
        <span>Total time off: <strong>{totalTimeOff} weeks</strong></span>
      </div>
    </div>
  );
};

export default TimeOffForm;
