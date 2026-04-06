import React from 'react';
import { KdsLabel, KdsRadio, MxInputTextBox } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';

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

  const calculated = calculateResults(activeIC);
  const totalTimeOff = calculated ? calculated.totalTimeOffWeeks.toFixed(1) : '0.0';

  return (
    <div className="kds-Card kds-Card--m kds-card-section">
      <h2 className="kds-Heading kds-Heading--s section-heading">Time Off</h2>
      <div className="form-grid-2col">
        <div>
          <div className="okr-row">
            <div className="okr-input">
              <div onKeyDown={allowNumericOnly}>
                <MxInputTextBox
                  label="OKR Time"
                  value={String(activeIC.timeOff.okrTime.value)}
                  onChange={handleOKRValueChange}
                  mask="none"
                  isClearable={false}
                />
              </div>
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
          <div onKeyDown={allowNumericOnly}>
            <MxInputTextBox
              label="PTO Days"
              value={String(activeIC.timeOff.ptoDays)}
              onChange={handlePTOChange}
              mask="none"
              isClearable={false}
            />
          </div>
        </div>

        <div>
          <div onKeyDown={allowNumericOnly}>
            <MxInputTextBox
              label="Dev / L&D Days"
              value={String(activeIC.timeOff.devDays)}
              onChange={handleDevChange}
              mask="none"
              isClearable={false}
            />
          </div>
        </div>

        <div>
          <div onKeyDown={allowNumericOnly}>
            <MxInputTextBox
              label="Holiday Days"
              value={String(activeIC.timeOff.holidayDays)}
              onChange={handleHolidayChange}
              mask="none"
              isClearable={false}
            />
          </div>
        </div>
      </div>

      <div className="summary-box">
        <span>Total time off: <strong>{totalTimeOff} weeks</strong></span>
      </div>
    </div>
  );
};

export default TimeOffForm;
