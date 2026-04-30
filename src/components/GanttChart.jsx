import React from 'react';
import { useCapacity } from '../context/CapacityContext';
import { getCurrentFiscalPeriod, getQuarterStartDate, getQuarterWeeks } from '../utils/fiscalCalendar';
import { getProjectWeeks, calculateTotalPTO } from '../utils/calculations';

const DOMAIN_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ef4444', '#06b6d4', '#84cc16', '#f97316',
];

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function getPeriodsForQuarter(quarter, totalWeeks) {
  const qIndex = { Q1: 0, Q2: 1, Q3: 2, Q4: 3 }[quarter] ?? 0;
  const firstPeriod = qIndex * 3 + 1;
  const base = [
    { name: `P${firstPeriod}`, weeks: 4 },
    { name: `P${firstPeriod + 1}`, weeks: 5 },
    { name: `P${firstPeriod + 2}`, weeks: 4 },
  ];
  if (quarter === 'Q4' && totalWeeks > 13) {
    base.push({ name: 'P13', weeks: totalWeeks - 13 });
  }
  return base;
}

const GanttBar = ({ project, domainColor, fyStart, totalWeeks }) => {
  const weeks = getProjectWeeks(project);
  if (weeks === 0) return null;

  const unscheduled = !project.startDate;
  let leftPct = 0;
  let widthPct = (weeks / totalWeeks) * 100;

  if (!unscheduled) {
    const startWeeks = (new Date(project.startDate) - fyStart) / MS_PER_WEEK;
    const rawLeft = (startWeeks / totalWeeks) * 100;
    const rawRight = rawLeft + widthPct;
    const clampedLeft = Math.max(0, Math.min(rawLeft, 100));
    const clampedRight = Math.max(0, Math.min(rawRight, 100));
    leftPct = clampedLeft;
    widthPct = clampedRight - clampedLeft;
  }

  if (widthPct <= 0) return null;

  const label = project.title || 'Untitled';
  const tooltip = `${label} · ${weeks}w${project.startDate ? ` · starts ${project.startDate}` : ' · no start date'}`;

  return (
    <div
      className={`gantt-bar${unscheduled ? ' gantt-bar--unscheduled' : ''}`}
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        backgroundColor: unscheduled ? '#e5e7eb' : domainColor,
        borderColor: unscheduled ? '#9ca3af' : domainColor,
      }}
      title={tooltip}
    >
      <span className="gantt-bar-label">{label}</span>
    </div>
  );
};

const GanttPTOBar = ({ pto, fyStart, totalWeeks }) => {
  if (!pto.startDate || !pto.endDate) return null;

  const startDate = new Date(pto.startDate);
  const endDate = new Date(pto.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
    return null;
  }

  const startWeeks = (startDate - fyStart) / MS_PER_WEEK;
  const endWeeks = (endDate - fyStart) / MS_PER_WEEK;
  const weeks = endWeeks - startWeeks;

  const rawLeft = (startWeeks / totalWeeks) * 100;
  const rawRight = rawLeft + (weeks / totalWeeks) * 100;
  const clampedLeft = Math.max(0, Math.min(rawLeft, 100));
  const clampedRight = Math.max(0, Math.min(rawRight, 100));
  const leftPct = clampedLeft;
  const widthPct = clampedRight - clampedLeft;

  if (widthPct <= 0) return null;

  const tooltip = `PTO: ${pto.type} · ${pto.startDate} to ${pto.endDate} · ${weeks.toFixed(1)}w`;

  return (
    <div
      className="gantt-bar gantt-pto-bar"
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        backgroundColor: '#ff282f',
        borderColor: '#ff282f',
      }}
      title={tooltip}
    >
      <span className="gantt-bar-label">{pto.type}</span>
    </div>
  );
};

const GanttMemberSection = ({ ic, fyStart, totalWeeks }) => {
  const rows = [];
  ic.domains.forEach((domain, di) => {
    const validProjects = (domain.projects || []).filter(p => getProjectWeeks(p) > 0);
    if (validProjects.length === 0) return;
    validProjects.forEach((project, pi) => {
      rows.push({ domain, domainIndex: di, project, showLabel: pi === 0 });
    });
  });

  const isEmpty = rows.length === 0;
  const ptoInstances = ic.ptoInstances || [];
  const hasPTO = ptoInstances.length > 0;

  return (
    <div className="gantt-member-section">
      <div className="gantt-label-col gantt-sticky-left">
        <div className="gantt-member-name">{ic.icName || 'Unnamed'}</div>
        {ic.icRole && <div className="gantt-member-role">{ic.icRole}</div>}
      </div>

      <div className="gantt-domain-rows">
        {/* PTO Row - always shows if there are PTO instances */}
        {hasPTO && (
          <div className="gantt-domain-row">
            <div className="gantt-domain-col gantt-sticky-domain">PTO</div>
            <div className="gantt-bars-track">
              {ptoInstances.map((pto, idx) => (
                <GanttPTOBar
                  key={idx}
                  pto={pto}
                  fyStart={fyStart}
                  totalWeeks={totalWeeks}
                />
              ))}
            </div>
          </div>
        )}

        {/* Domain/Project Rows */}
        {isEmpty && !hasPTO ? (
          <div className="gantt-domain-row">
            <div className="gantt-domain-col gantt-sticky-domain" />
            <div className="gantt-bars-track">
              <span className="gantt-no-projects">No projects scheduled</span>
            </div>
          </div>
        ) : (
          rows.map(({ domain, domainIndex, project, showLabel }) => (
            <div key={project.id} className="gantt-domain-row">
              <div className="gantt-domain-col gantt-sticky-domain" title={showLabel ? domain.name : ''}>
                {showLabel ? (domain.name || '') : ''}
              </div>
              <div className="gantt-bars-track">
                <GanttBar
                  project={project}
                  domainColor={DOMAIN_COLORS[domainIndex % DOMAIN_COLORS.length]}
                  fyStart={fyStart}
                  totalWeeks={totalWeeks}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const GanttChart = () => {
  const { ics } = useCapacity();
  const currentPeriod = getCurrentFiscalPeriod();

  if (!currentPeriod) {
    return <div className="gantt-empty">Unable to determine current fiscal quarter.</div>;
  }

  const { fiscalYear, quarter: currentQuarter } = currentPeriod;

  const allQuarters = ['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
    const weeks = getQuarterWeeks(fiscalYear, q);
    return {
      quarter: q,
      startDate: getQuarterStartDate(fiscalYear, q),
      weeks,
      periods: getPeriodsForQuarter(q, weeks),
      isCurrent: q === currentQuarter,
    };
  });

  const fyStart = allQuarters[0].startDate;
  const totalWeeks = allQuarters.reduce((sum, q) => sum + q.weeks, 0);
  const allPeriods = allQuarters.flatMap(q => q.periods);

  const today = new Date();
  const todayWeekOffset = (today - fyStart) / MS_PER_WEEK;
  const todayPct = (todayWeekOffset / totalWeeks) * 100;
  const todayInRange = todayPct >= 0 && todayPct <= 100;

  const chartStyle = {
    '--gantt-total-weeks': totalWeeks,
    '--today-pct': todayInRange ? `${todayPct}%` : '-9999px',
  };

  // Pixel offsets for Q2/Q3/Q4 boundary lines: 230px sticky cols + cumulative weeks at 40px each
  let cumWeeks = 0;
  const quarterBoundaryPx = allQuarters.slice(0, -1).map(q => {
    cumWeeks += q.weeks;
    return 230 + cumWeeks * 40;
  });

  if (ics.length === 0) {
    return <div className="gantt-empty">No team members to display.</div>;
  }

  return (
    <div className="gantt-wrapper">
      <div className="gantt-chart" style={chartStyle}>

        {/* Quarter header row */}
        <div className="gantt-quarter-header-row">
          <div className="gantt-label-col gantt-sticky-left gantt-quarter-label-cell">
            FY{fiscalYear}
          </div>
          <div className="gantt-domain-col gantt-sticky-domain gantt-quarter-label-cell" />
          <div className="gantt-flex-track">
            {allQuarters.map(q => (
              <div
                key={q.quarter}
                className={`gantt-quarter-cell${q.isCurrent ? ' gantt-quarter-cell--current' : ''}`}
                style={{ width: q.weeks * 40 }}
              >
                {q.quarter}
              </div>
            ))}
          </div>
        </div>

        {/* Period header row */}
        <div className="gantt-period-header">
          <div className="gantt-label-col gantt-sticky-left" />
          <div className="gantt-domain-col gantt-sticky-domain" />
          <div className="gantt-period-track">
            {allPeriods.map(p => (
              <div key={p.name} className="gantt-period-cell" style={{ width: p.weeks * 40 }}>
                {p.name}
              </div>
            ))}
          </div>
        </div>

        {/* Week header row */}
        <div className="gantt-header-row">
          <div className="gantt-label-col gantt-header-cell gantt-sticky-left" />
          <div className="gantt-domain-col gantt-header-cell gantt-sticky-domain" />
          <div className="gantt-bars-track gantt-week-header">
            {Array.from({ length: totalWeeks }, (_, i) => {
              const weekDate = new Date(fyStart.getTime() + i * MS_PER_WEEK);
              const dateLabel = weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <div key={i} className="gantt-week-tick">
                  <span className="gantt-week-date">{dateLabel}</span>
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

        {/* IC rows */}
        {ics.map(ic => (
          <GanttMemberSection
            key={ic.id}
            ic={ic}
            fyStart={fyStart}
            totalWeeks={totalWeeks}
          />
        ))}

        {/* Continuous quarter boundary lines spanning the full chart height */}
        <div className="gantt-boundary-overlay" aria-hidden="true">
          {quarterBoundaryPx.map((px, i) => (
            <div
              key={i}
              className="gantt-boundary-line"
              style={{ left: px }}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default GanttChart;
