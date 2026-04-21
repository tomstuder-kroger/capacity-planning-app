import React from 'react';
import { KdsLabel, KdsRadio, MxInputTextBox, KdsTooltippable } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';

// Tooltip component using KDS tooltippable
const Tooltip = ({ content }) => {
  return (
    <KdsTooltippable
      side="bottom"
      align="center"
      tooltipText={content}
      tooltipType="description"
    >
      <button
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginLeft: '0.35rem',
          background: 'none',
          border: '1px solid #6b7280',
          borderRadius: '50%',
          width: '1.2em',
          height: '1.2em',
          padding: '0',
          color: '#6b7280',
          fontSize: '0.875rem',
          fontWeight: 600,
          lineHeight: 1,
          tabIndex: 0
        }}
      >
        i
      </button>
    </KdsTooltippable>
  );
};

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
      <h2 className="kds-Heading kds-Heading--s section-heading">
        Quarterly Planning & PTO
      </h2>
      <div className="form-grid-2col">
        <div>
          <div className="okr-row">
            <div className="okr-input">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>OKR Time</label>
                <Tooltip content="Provide the time spent during OKR Planning with your team." />
              </div>
              <div onKeyDown={allowNumericOnly}>
                <MxInputTextBox
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
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>PTO Days</label>
            <Tooltip content="Provide the number of days or weeks planned out of office." />
          </div>
          <div onKeyDown={allowNumericOnly}>
            <MxInputTextBox
              value={String(activeIC.timeOff.ptoDays)}
              onChange={handlePTOChange}
              mask="none"
              isClearable={false}
            />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Dev / L&D Days</label>
            <Tooltip content="KTD provides Learning and Development days for FTE Associates only. Provide the number of days you will use during the quarter" />
          </div>
          <div onKeyDown={allowNumericOnly}>
            <MxInputTextBox
              value={String(activeIC.timeOff.devDays)}
              onChange={handleDevChange}
              mask="none"
              isClearable={false}
            />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Holiday Days</label>
            <Tooltip content="Provide the number of Holidays during the quarter." />
          </div>
          <div onKeyDown={allowNumericOnly}>
            <MxInputTextBox
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
