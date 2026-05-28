import React, { useRef, useEffect, useState } from 'react';
import { useCapacity } from '../context/CapacityContext';
import { getCurrentFiscalPeriod, getQuarterStartDate, getQuarterWeeks, getQuarterPeriods } from '../utils/fiscalCalendar';
import { getProjectWeeks } from '../utils/calculations';

// One hue per person — spread around the color wheel
const PERSON_HUES = [217, 158, 43, 271, 5, 185, 82, 316, 24, 340];

// Lightness steps per domain — darker first, progressively lighter
const DOMAIN_LIGHTNESS = [38, 50, 62, 70];

function getDomainColor(personHue, domainIndex) {
  const L = DOMAIN_LIGHTNESS[Math.min(domainIndex, DOMAIN_LIGHTNESS.length - 1)];
  return `hsl(${personHue}, 65%, ${L}%)`;
}

function getDomainTextColor(domainIndex) {
  const L = DOMAIN_LIGHTNESS[Math.min(domainIndex, DOMAIN_LIGHTNESS.length - 1)];
  return L >= 55 ? '#1f2937' : 'white';
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;


const GanttBar = ({ project, domainColor, textColor, fyStart, totalWeeks }) => {
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
      <span className="gantt-bar-label" style={{ color: textColor }}>{label}</span>
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

const GanttMemberSection = ({ ic, icIndex, fyStart, totalWeeks }) => {
  const personHue = PERSON_HUES[icIndex % PERSON_HUES.length];
  const personBaseColor = `hsl(${personHue}, 65%, 38%)`;
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
    <div className="gantt-member-section" style={{ borderLeft: `4px solid ${personBaseColor}` }}>
      <div className="gantt-label-col gantt-sticky-left">
        <div className="gantt-member-name" style={{ color: personBaseColor }}>{ic.icName || 'Unnamed'}</div>
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
                  domainColor={getDomainColor(personHue, domainIndex)}
                  textColor={getDomainTextColor(domainIndex)}
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

const STICKY_WIDTH = 230; // 150px label col + 80px domain col

const GanttChart = ({ quarterFilter = null }) => {
  const { ics } = useCapacity();
  const wrapperRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);
  const currentPeriod = getCurrentFiscalPeriod();

  if (!currentPeriod) {
    return <div className="gantt-empty">Unable to determine current fiscal quarter.</div>;
  }

  const { fiscalYear, quarter: currentQuarter } = currentPeriod;

  const rawQuarters = ['Q1', 'Q2', 'Q3', 'Q4'].map(q => ({
    quarter: q,
    startDate: getQuarterStartDate(fiscalYear, q),
    nominalWeeks: getQuarterWeeks(fiscalYear, q),
    isCurrent: q === currentQuarter,
  }));

  const allQuarters = rawQuarters.map((qData, i) => {
    const nextQ = rawQuarters[i + 1];
    const actualWeeks = nextQ
      ? (nextQ.startDate - qData.startDate) / MS_PER_WEEK
      : qData.nominalWeeks;
    const rawPeriods = getQuarterPeriods(fiscalYear, qData.quarter);
    const periodSum = rawPeriods.reduce((s, p) => s + p.weeks, 0);
    const scale = periodSum > 0 ? actualWeeks / periodSum : 1;
    const periods = rawPeriods.map(p => ({ ...p, weeks: p.weeks * scale }));
    return { ...qData, weeks: actualWeeks, periods };
  });

  const displayedQuarters = quarterFilter
    ? allQuarters.filter(q => q.quarter === quarterFilter)
    : allQuarters;

  const fyStart = displayedQuarters[0].startDate;
  const totalWeeks = displayedQuarters.reduce((sum, q) => sum + q.weeks, 0);
  const allPeriods = displayedQuarters.flatMap(q => q.periods);

  const weekWidth = quarterFilter && containerWidth > 0
    ? Math.max(40, (containerWidth - STICKY_WIDTH) / totalWeeks)
    : 40;

  const today = new Date();
  const todayWeekOffset = (today - fyStart) / MS_PER_WEEK;
  const todayPct = (todayWeekOffset / totalWeeks) * 100;
  const todayInRange = todayPct >= 0 && todayPct <= 100;

  const chartStyle = {
    '--gantt-total-weeks': totalWeeks,
    '--gantt-week-width': `${weekWidth}px`,
    '--today-pct': todayInRange ? `${todayPct}%` : '-9999px',
  };

  // Pixel offsets for quarter boundary lines: sticky cols + cumulative weeks
  let cumWeeks = 0;
  const quarterBoundaryPx = displayedQuarters.slice(0, -1).map(q => {
    cumWeeks += q.weeks;
    return STICKY_WIDTH + cumWeeks * weekWidth;
  });

  if (ics.length === 0) {
    return <div className="gantt-empty">No team members to display.</div>;
  }

  return (
    <div className="gantt-wrapper" ref={wrapperRef}>
      <div className="gantt-chart" style={chartStyle}>

        {/* Quarter header row */}
        <div className="gantt-quarter-header-row">
          <div className="gantt-label-col gantt-sticky-left gantt-quarter-label-cell">
            FY{fiscalYear}
          </div>
          <div className="gantt-domain-col gantt-sticky-domain gantt-quarter-label-cell" />
          <div className="gantt-flex-track">
            {displayedQuarters.map(q => (
              <div
                key={q.quarter}
                className={`gantt-quarter-cell${q.isCurrent ? ' gantt-quarter-cell--current' : ''}`}
                style={{ width: q.weeks * weekWidth }}
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
              <div key={p.name} className="gantt-period-cell" style={{ width: p.weeks * weekWidth }}>
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
            {Array.from({ length: Math.round(totalWeeks) }, (_, i) => {
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
        {ics.map((ic, icIndex) => (
          <GanttMemberSection
            key={ic.id}
            ic={ic}
            icIndex={icIndex}
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
