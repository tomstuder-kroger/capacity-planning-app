import React, { useState } from 'react';

const WIDTH = 480;
const HEIGHT = 180;
const PAD_X = 36;
const PAD_TOP = 24;
const PAD_BOTTOM = 28;

const WEEKS_COLOR = '#1a7f3c';
const PERCENT_COLOR = '#2563eb';

const METRICS = [
  { key: 'weeks', label: 'Weeks' },
  { key: 'percent', label: 'Utilization %' },
  { key: 'overlay', label: 'Overlay' },
];

// Renders one line + its point markers/labels against a shared x-axis and its own y-scale.
const Series = ({ points, xFor, yFor, color, formatValue, labelOffset = 0 }) => {
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p)}`)
    .join(' ');

  return (
    <>
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} />
      {points.map((p, i) => (
        <g key={p.label}>
          <circle cx={xFor(i)} cy={yFor(p)} r={4} fill={color} />
          <text
            x={xFor(i)}
            y={yFor(p) - 10 - labelOffset}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill={color}
          >
            {formatValue(p)}
          </text>
        </g>
      ))}
    </>
  );
};

const CapacityLineChart = ({ points }) => {
  const [metric, setMetric] = useState('weeks');

  const plotWidth = WIDTH - PAD_X * 2;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const xFor = (i) => PAD_X + (points.length > 1 ? (i / (points.length - 1)) * plotWidth : plotWidth / 2);

  const weeksValues = points.map(p => p.weeks || 0);
  const weeksMax = Math.max(...weeksValues, 0) * 1.15 || 1;
  const yForWeeks = (p) => PAD_TOP + plotHeight - ((p.weeks || 0) / weeksMax) * plotHeight;

  const percentValues = points.map(p => p.percent || 0);
  const percentMax = Math.max(...percentValues, 100) * 1.15 || 1;
  const yForPercent = (p) => PAD_TOP + plotHeight - ((p.percent || 0) / percentMax) * plotHeight;

  const showWeeks = metric === 'weeks' || metric === 'overlay';
  const showPercent = metric === 'percent' || metric === 'overlay';

  return (
    <div className="border border-border rounded-lg bg-muted/30 p-4">
      <div className="flex gap-1 mb-3">
        {METRICS.map(m => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMetric(m.key)}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
              metric === m.key
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {metric === 'overlay' && (
        <div className="flex gap-4 mb-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: WEEKS_COLOR }} />
            Weeks
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PERCENT_COLOR }} />
            Utilization %
          </span>
        </div>
      )}

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" style={{ maxHeight: 220 }}>
        <line
          x1={PAD_X}
          y1={PAD_TOP + plotHeight}
          x2={WIDTH - PAD_X}
          y2={PAD_TOP + plotHeight}
          stroke="currentColor"
          className="text-border"
          strokeWidth={1}
        />

        {showWeeks && (
          <Series
            points={points}
            xFor={xFor}
            yFor={yForWeeks}
            color={WEEKS_COLOR}
            formatValue={(p) => `${(p.weeks || 0).toFixed(1)}w`}
          />
        )}
        {showPercent && (
          <Series
            points={points}
            xFor={xFor}
            yFor={yForPercent}
            color={PERCENT_COLOR}
            formatValue={(p) => `${(p.percent || 0).toFixed(0)}%`}
            labelOffset={showWeeks ? 14 : 0}
          />
        )}

        {points.map((p, i) => (
          <text
            key={p.label}
            x={xFor(i)}
            y={PAD_TOP + plotHeight + 18}
            textAnchor="middle"
            fontSize={11}
            fill="currentColor"
            className="text-muted-foreground"
          >
            {p.label}
            {p.isCurrent ? ' (current)' : ''}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default CapacityLineChart;
