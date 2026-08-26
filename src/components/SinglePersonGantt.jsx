import React, { useRef, useEffect, useState } from 'react';
import { getCurrentFiscalPeriod, getQuarterStartDate, getQuarterWeeks, getQuarterPeriods } from '../utils/fiscalCalendar';
import { getProjectWeeks, parseLocalDate } from '../utils/calculations';

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const PERSON_HUES = [217, 158, 43, 271, 5, 185, 82, 316, 24, 340];
const DOMAIN_LIGHTNESS = [38, 50, 62, 70];
const STICKY_WIDTH = 140; // domain col only — label col omitted in this compact view

function getDomainColor(personHue, di) {
  const L = DOMAIN_LIGHTNESS[Math.min(di, DOMAIN_LIGHTNESS.length - 1)];
  return `hsl(${personHue}, 65%, ${L}%)`;
}
function getDomainTextColor(di) {
  const L = DOMAIN_LIGHTNESS[Math.min(di, DOMAIN_LIGHTNESS.length - 1)];
  return L >= 55 ? '#1f2937' : 'white';
}

// Override sticky positioning so headers don't escape the panel scroll container
const INLINE_STATIC = { position: 'relative', top: 'auto' };

const SinglePersonGantt = ({ ic, icIndex }) => {
  const wrapperRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver(entries => setContainerWidth(entries[0].contentRect.width));
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  const currentPeriod = getCurrentFiscalPeriod();
  if (!currentPeriod) return null;

  const { fiscalYear, quarter: currentQuarter } = currentPeriod;
  const quarterStart = getQuarterStartDate(fiscalYear, currentQuarter);

  // Accurate week count using next quarter's start date
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const nextQ = quarters[quarters.indexOf(currentQuarter) + 1];
  const totalWeeks = nextQ
    ? (getQuarterStartDate(fiscalYear, nextQ) - quarterStart) / MS_PER_WEEK
    : getQuarterWeeks(fiscalYear, currentQuarter);

  const rawPeriods = getQuarterPeriods(fiscalYear, currentQuarter);
  const periodSum = rawPeriods.reduce((s, p) => s + p.weeks, 0);
  const scale = periodSum > 0 ? totalWeeks / periodSum : 1;
  const periods = rawPeriods.map(p => ({ ...p, weeks: p.weeks * scale }));

  const weekWidth = containerWidth > 0
    ? Math.max(28, (containerWidth - STICKY_WIDTH) / totalWeeks)
    : 40;

  const today = new Date();
  const todayPct = ((today - quarterStart) / MS_PER_WEEK / totalWeeks) * 100;
  const todayInRange = todayPct >= 0 && todayPct <= 100;

  const personHue = PERSON_HUES[icIndex % PERSON_HUES.length];
  const personBaseColor = `hsl(${personHue}, 65%, 38%)`;

  const chartStyle = {
    '--gantt-total-weeks': totalWeeks,
    '--gantt-week-width': `${weekWidth}px`,
    '--today-pct': todayInRange ? `${todayPct}%` : '-9999px',
    maxHeight: 'none',
    overflowY: 'visible',
  };

  // Collect domain rows, skipping projects with no visible bar in the current quarter
  const rows = [];
  ic.domains.forEach((domain, di) => {
    const visibleProjects = (domain.projects || []).filter(p => {
      const weeks = getProjectWeeks(p);
      if (weeks <= 0) return false;
      if (!p.startDate) return true;
      const startW = (parseLocalDate(p.startDate) - quarterStart) / MS_PER_WEEK;
      const l = Math.max(0, Math.min((startW / totalWeeks) * 100, 100));
      const r = Math.max(0, Math.min(((startW + weeks) / totalWeeks) * 100, 100));
      return r - l > 0;
    });
    visibleProjects.forEach((project, pi) => {
      rows.push({ domain, domainIndex: di, project, showLabel: pi === 0 });
    });
  });
  const isEmpty = rows.length === 0;
  const ptoInstances = ic.ptoInstances || [];

  return (
    <div className="gantt-wrapper" ref={wrapperRef}>
      <div className="gantt-chart" style={chartStyle}>

        {/* Quarter header */}
        <div className="gantt-quarter-header-row" style={INLINE_STATIC}>
          <div className="gantt-domain-col gantt-sticky-domain gantt-quarter-label-cell" style={{ left: 0, width: 140, color: 'white' }}>FY{fiscalYear}</div>
          <div className="gantt-flex-track">
            <div className="gantt-quarter-cell gantt-quarter-cell--current" style={{ width: totalWeeks * weekWidth }}>
              {currentQuarter}
            </div>
          </div>
        </div>

        {/* Period header */}
        <div className="gantt-period-header" style={INLINE_STATIC}>
          <div className="gantt-domain-col gantt-sticky-domain" style={{ left: 0, width: 140 }} />
          <div className="gantt-period-track">
            {periods.map(p => (
              <div key={p.name} className="gantt-period-cell" style={{ width: p.weeks * weekWidth }}>{p.name}</div>
            ))}
          </div>
        </div>

        {/* Week header */}
        <div className="gantt-header-row" style={INLINE_STATIC}>
          <div className="gantt-domain-col gantt-header-cell gantt-sticky-domain" style={{ left: 0, width: 140 }} />
          <div className="gantt-bars-track gantt-week-header">
            {Array.from({ length: Math.round(totalWeeks) }, (_, i) => {
              const d = new Date(quarterStart.getTime() + i * MS_PER_WEEK);
              return (
                <div key={i} className="gantt-week-tick">
                  <span className="gantt-week-date">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              );
            })}
            {todayInRange && (
              <div className="gantt-today-line" style={{ left: `${todayPct}%` }}>
                <span className="gantt-today-label">Today</span>
              </div>
            )}
          </div>
        </div>

        {/* Member rows */}
        <div className="gantt-member-section">
          <div className="gantt-domain-rows">
            {/* PTO row */}
            {ptoInstances.length > 0 && (
              <div className="gantt-domain-row">
                <div className="gantt-domain-col gantt-sticky-domain" style={{ left: 0, width: 140 }}>PTO</div>
                <div className="gantt-bars-track">
                  {ptoInstances.map((pto, idx) => {
                    if (!pto.startDate || !pto.endDate) return null;
                    const s = parseLocalDate(pto.startDate), e = parseLocalDate(pto.endDate);
                    if (isNaN(s) || isNaN(e) || s > e) return null;
                    const startW = (s - quarterStart) / MS_PER_WEEK;
                    const wks = (e - s) / MS_PER_WEEK;
                    const l = Math.max(0, Math.min((startW / totalWeeks) * 100, 100));
                    const r = Math.max(0, Math.min(((startW + wks) / totalWeeks) * 100, 100));
                    if (r - l <= 0) return null;
                    return (
                      <div key={idx} className="gantt-bar gantt-pto-bar"
                        style={{ left: `${l}%`, width: `${r - l}%`, backgroundColor: '#ff282f', borderColor: '#ff282f' }}
                        title={`PTO · ${pto.startDate} to ${pto.endDate}`}>
                        <span className="gantt-bar-label">{pto.type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Project rows */}
            {isEmpty && ptoInstances.length === 0 ? (
              <div className="gantt-domain-row">
                <div className="gantt-domain-col gantt-sticky-domain" style={{ left: 0, width: 140 }} />
                <div className="gantt-bars-track">
                  <span className="gantt-no-projects">No projects scheduled</span>
                </div>
              </div>
            ) : rows.map(({ domain, domainIndex, project, showLabel }) => {
              const weeks = getProjectWeeks(project);
              const unscheduled = !project.startDate;
              let leftPct = 0;
              let widthPct = (weeks / totalWeeks) * 100;

              if (!unscheduled) {
                const startW = (parseLocalDate(project.startDate) - quarterStart) / MS_PER_WEEK;
                const l = Math.max(0, Math.min((startW / totalWeeks) * 100, 100));
                const r = Math.max(0, Math.min(((startW + weeks) / totalWeeks) * 100, 100));
                leftPct = l;
                widthPct = r - l;
              }

              const domainColor = getDomainColor(personHue, domainIndex);
              const textColor = getDomainTextColor(domainIndex);

              return (
                <div key={project.id} className="gantt-domain-row">
                  <div className="gantt-domain-col gantt-sticky-domain" style={{ left: 0, width: 140 }} title={showLabel ? domain.name : ''}>
                    <span className="truncate">{showLabel ? (domain.name || '') : ''}</span>
                  </div>
                  <div className="gantt-bars-track">
                    {widthPct > 0 && (
                      <div
                        className={`gantt-bar${unscheduled ? ' gantt-bar--unscheduled' : ''}`}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          backgroundColor: unscheduled ? '#e5e7eb' : domainColor,
                          borderColor: unscheduled ? '#9ca3af' : domainColor,
                        }}
                        title={`${project.title || 'Untitled'} · ${weeks}w`}
                      >
                        <span className="gantt-bar-label" style={{ color: textColor }}>{project.title || 'Untitled'}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SinglePersonGantt;
