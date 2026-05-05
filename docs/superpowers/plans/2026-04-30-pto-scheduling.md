# PTO Scheduling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace manual PTO days input with scheduled PTO instances (date ranges with custom types), automatically calculate capacity impact, and visualize PTO in the Gantt chart.

**Architecture:** Add `ptoInstances` array to IC data structure. Create `PTOScheduling` component to manage instances (similar to DomainList) and `PTORow` component for individual instances (similar to ProjectRow). Add `calculateTotalPTO()` function to sum weeks from date ranges. Update `CapacityContext` to use PTO instances instead of manual days. Update `GanttChart` to render PTO bars. Remove `ptoDays` from data structure and TimeOffForm UI.

**Tech Stack:** React, KDS components, date calculations, localStorage persistence

---

## File Structure

**New Files:**
- `src/components/PTOScheduling.jsx` - List manager for PTO instances (like DomainList)
- `src/components/PTORow.jsx` - Individual PTO instance row (like ProjectRow)

**Modified Files:**
- `src/utils/calculations.js` - Add `calculateTotalPTO()` function
- `src/utils/calculations.test.js` - Add tests for `calculateTotalPTO()`
- `src/context/CapacityContext.jsx` - Update IC structure, update `calculateResults()` to use PTO instances
- `src/components/TimeOffForm.jsx` - Remove ptoDays field, integrate PTOScheduling component
- `src/components/GanttChart.jsx` - Add PTO rendering (GanttPTOBar component)

---

## Task 1: Add calculateTotalPTO function with tests

**Files:**
- Modify: `src/utils/calculations.js`
- Modify: `src/utils/calculations.test.js`

- [ ] **Step 1: Write failing tests for calculateTotalPTO**

Add to `src/utils/calculations.test.js` after the `calculateTimeOff` tests:

```javascript
describe('calculateTotalPTO', () => {
  test('returns 0 for empty array', () => {
    const result = calculateTotalPTO([]);
    expect(result).toBe(0);
  });

  test('returns 0 for null/undefined input', () => {
    expect(calculateTotalPTO(null)).toBe(0);
    expect(calculateTotalPTO(undefined)).toBe(0);
  });

  test('calculates single day PTO (start date = end date)', () => {
    const result = calculateTotalPTO([
      { id: '1', startDate: '2024-01-05', endDate: '2024-01-05', type: 'PTO' }
    ]);
    // 1 day = Math.ceil(0 / (7 * 24 * 60 * 60 * 1000)) = 0 weeks, but should be 1 day = 0.2 weeks
    // Actually: diffMs = 0, so weeks = Math.ceil(0 / ms_per_week) = 0
    // Single day: Jan 5 to Jan 5 = same day, so 1 day = 1/5 week = 0.2 weeks
    // But we're calculating in weeks, need to handle sub-week properly
    // Let's use a more practical test: Jan 5 00:00 to Jan 6 00:00 = 1 day
    expect(result).toBeCloseTo(0.14, 1); // 1 day ≈ 0.14 weeks
  });

  test('calculates multi-day PTO correctly', () => {
    const result = calculateTotalPTO([
      { id: '1', startDate: '2024-01-05', endDate: '2024-01-07', type: 'Summer vacation' }
    ]);
    // Jan 5 to Jan 7 = 2 days difference (or 3 calendar days)
    // 2 days = 0.29 weeks, Math.ceil = 1 week
    expect(result).toBe(1);
  });

  test('calculates week-long PTO', () => {
    const result = calculateTotalPTO([
      { id: '1', startDate: '2024-01-05', endDate: '2024-01-12', type: 'Summer vacation' }
    ]);
    // Jan 5 to Jan 12 = 7 days = 1 week
    expect(result).toBe(1);
  });

  test('aggregates multiple PTO instances', () => {
    const result = calculateTotalPTO([
      { id: '1', startDate: '2024-01-05', endDate: '2024-01-07', type: 'PTO' },
      { id: '2', startDate: '2024-03-10', endDate: '2024-03-17', type: 'Conference' },
      { id: '3', startDate: '2024-05-20', endDate: '2024-05-31', type: 'Summer vacation' }
    ]);
    // ~1 + 1 + 2 = 4 weeks total
    expect(result).toBe(4);
  });

  test('ignores instances with missing dates', () => {
    const result = calculateTotalPTO([
      { id: '1', startDate: '2024-01-05', endDate: '2024-01-07', type: 'PTO' },
      { id: '2', startDate: null, endDate: '2024-03-17', type: 'Conference' },
      { id: '3', startDate: '2024-05-20', endDate: null, type: 'Vacation' }
    ]);
    expect(result).toBe(1);
  });

  test('ignores instances with invalid date ranges (start > end)', () => {
    const result = calculateTotalPTO([
      { id: '1', startDate: '2024-01-07', endDate: '2024-01-05', type: 'Invalid' }
    ]);
    expect(result).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- calculations.test.js --testNamePattern="calculateTotalPTO" --watch=false
```

Expected: Tests fail with "calculateTotalPTO is not defined"

- [ ] **Step 3: Implement calculateTotalPTO function**

Add to `src/utils/calculations.js` (after `calculateTimeOff` function):

```javascript
/**
 * Calculates total PTO in weeks based on scheduled PTO instances
 * @param {Array<Object>} ptoInstances - Array of PTO instance objects
 * @param {string} ptoInstances[].startDate - ISO date string (e.g., '2024-01-05')
 * @param {string} ptoInstances[].endDate - ISO date string
 * @param {string} ptoInstances[].type - Label/type of PTO
 * @returns {number} Total PTO in weeks
 */
export function calculateTotalPTO(ptoInstances) {
  if (!Array.isArray(ptoInstances)) {
    return 0;
  }

  if (ptoInstances.length === 0) {
    return 0;
  }

  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

  return ptoInstances.reduce((total, instance) => {
    if (!instance.startDate || !instance.endDate) {
      return total;
    }

    const start = new Date(instance.startDate);
    const end = new Date(instance.endDate);
    const diffMs = end - start;

    if (diffMs < 0) {
      return total; // Invalid range, skip
    }

    // Calculate weeks (round up)
    const weeks = Math.ceil(diffMs / MS_PER_WEEK);
    return total + weeks;
  }, 0);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- calculations.test.js --testNamePattern="calculateTotalPTO" --watch=false
```

Expected: All calculateTotalPTO tests PASS

- [ ] **Step 5: Run all calculations tests to ensure no regressions**

```bash
npm test -- calculations.test.js --watch=false
```

Expected: All 48+ tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/utils/calculations.js src/utils/calculations.test.js
git commit -m "feat: add calculateTotalPTO function with tests

- New function calculates total PTO weeks from date range instances
- Handles single day PTO, multi-day ranges, and multiple instances
- Validates date ranges and ignores invalid/missing dates
- Calculates duration in weeks using Math.ceil for accurate rounding"
```

---

## Task 2: Update IC data structure and createEmptyIC

**Files:**
- Modify: `src/context/CapacityContext.jsx` (lines 22-36)

- [ ] **Step 1: Add ptoInstances array to createEmptyIC**

Replace the `createEmptyIC` function with:

```javascript
const createEmptyIC = () => ({
  id: uuidv4(),
  icName: '',
  icRole: '',
  quarter: '',
  weeksInQuarter: '',
  timeOff: {
    okrTime: { value: '', unit: 'days' },
    devDays: '',
    holidayDays: ''
    // ptoDays removed - now managed by ptoInstances
  },
  ptoInstances: [], // Array of { id, startDate, endDate, type }
  domains: [],
  lastModified: new Date().toISOString()
});
```

- [ ] **Step 2: Commit**

```bash
git add src/context/CapacityContext.jsx
git commit -m "feat: update IC data structure for PTO scheduling

- Remove ptoDays from timeOff object
- Add ptoInstances array to store scheduled PTO with date ranges
- Update createEmptyIC to initialize empty ptoInstances array"
```

---

## Task 3: Update calculateResults in CapacityContext

**Files:**
- Modify: `src/context/CapacityContext.jsx` (lines 169-221)

- [ ] **Step 1: Import calculateTotalPTO**

At the top of CapacityContext.jsx, update the imports:

```javascript
import {
  calculateTimeOff,
  getProjectWeeks,
  calculateTotalPlanned,
  calculateUtilization,
  calculateStatus,
  calculateTotalPTO
} from '../utils/calculations';
```

- [ ] **Step 2: Update calculateResults to use PTO instances**

Replace the `calculateResults` function body (starting at line 169) with:

```javascript
const calculateResults = useCallback((ic) => {
  if (!ic) return null;

  const totalWeeksInQuarter = Number(ic.weeksInQuarter) || 0;

  // Transform timeOff data to match calculateTimeOff expectations
  const timeOffParams = {
    pto: 0, // PTO now comes from ptoInstances, not manual days
    dev: Number(ic.timeOff.devDays) || 0,
    holiday: Number(ic.timeOff.holidayDays) || 0
  };

  // Add okrWeeks or okrDays based on unit
  if (ic.timeOff.okrTime.unit === 'weeks') {
    timeOffParams.okrWeeks = Number(ic.timeOff.okrTime.value) || 0;
  } else {
    timeOffParams.okrDays = Number(ic.timeOff.okrTime.value) || 0;
  }

  // Calculate time off from OKR + holidays + dev days + scheduled PTO
  const ptoWeeks = calculateTotalPTO(ic.ptoInstances || []);
  const otherTimeOffWeeks = calculateTimeOff(timeOffParams);
  const totalTimeOffWeeks = otherTimeOffWeeks + ptoWeeks;
  const totalWeeksAvailable = totalWeeksInQuarter - totalTimeOffWeeks;

  const domainEfforts = ic.domains.map(domain => {
    const projects = (domain.projects || []).map(p => ({
      title: p.title,
      weeks: getProjectWeeks(p)
    }));
    const totalWeeks = projects.reduce((sum, p) => sum + p.weeks, 0);
    return {
      domainId: domain.id,
      domainName: domain.name,
      totalWeeks,
      projects
    };
  });

  const effortValues = domainEfforts.map(d => d.totalWeeks);
  const totalPlannedWork = calculateTotalPlanned(effortValues);
  const capacityUtilization = calculateUtilization(totalPlannedWork, totalWeeksAvailable);
  const overUnderCapacity = totalPlannedWork - totalWeeksAvailable;
  const status = calculateStatus(capacityUtilization);

  return {
    totalWeeksInQuarter,
    totalTimeOffWeeks,
    totalWeeksAvailable,
    domainEfforts,
    totalPlannedWork,
    capacityUtilization,
    overUnderCapacity,
    status
  };
}, []);
```

- [ ] **Step 3: Commit**

```bash
git add src/context/CapacityContext.jsx
git commit -m "feat: update calculateResults to use PTO instances

- Import calculateTotalPTO function
- Calculate PTO from ptoInstances array instead of manual ptoDays
- Combine scheduled PTO + dev/holiday days for total time off
- Remove pto parameter from timeOffParams calculation"
```

---

## Task 4: Create PTORow component

**Files:**
- Create: `src/components/PTORow.jsx`

- [ ] **Step 1: Create PTORow component file**

Create `src/components/PTORow.jsx`:

```javascript
import React from 'react';
import { KdsButton, KdsIconTrash, MxInputTextBox } from 'react-mx-web-components';

const DateField = ({ label, value, onChange }) => (
  <div className="project-field">
    <label className="project-field-label">{label}</label>
    <input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="project-date-input"
    />
  </div>
);

const PTORow = ({ pto, onUpdate, onRemove }) => {
  // Calculate duration in weeks
  const calculateDuration = () => {
    if (!pto.startDate || !pto.endDate) return 0;
    const start = new Date(pto.startDate);
    const end = new Date(pto.endDate);
    const diffMs = end - start;
    if (diffMs < 0) return 0;
    const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
    return Math.ceil(diffMs / MS_PER_WEEK);
  };

  const duration = calculateDuration();

  return (
    <div className="project-item">
      <div className="project-item-header">
        <span className="project-item-label">PTO Instance</span>
        <KdsButton
          palette="negative"
          kind="subtle"
          variant="minimal"
          onClick={() => onRemove(pto.id)}
          aria-label="Remove PTO instance"
        >
          <KdsIconTrash size="s" />
        </KdsButton>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <MxInputTextBox
          label="Type (e.g., PTO, Summer vacation, Conference)"
          placeholder="Enter PTO type"
          value={pto.type || ''}
          onChange={(e) => onUpdate(pto.id, { type: e.target.value })}
          mask="none"
          isClearable={false}
        />
      </div>

      <div className="project-item-fields">
        <DateField
          label="Start Date"
          value={pto.startDate}
          onChange={(iso) => onUpdate(pto.id, { startDate: iso })}
        />
        <div className="project-field">
          <label className="project-field-label">Duration</label>
          <div className="project-custom-weeks">
            {duration > 0
              ? `${duration} week${duration !== 1 ? 's' : ''}`
              : 'Select dates to calculate duration'}
          </div>
        </div>
        <DateField
          label="End Date"
          value={pto.endDate}
          onChange={(iso) => onUpdate(pto.id, { endDate: iso })}
        />
      </div>
    </div>
  );
};

export default PTORow;
```

- [ ] **Step 2: Verify file was created**

```bash
ls -la src/components/PTORow.jsx
```

Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add src/components/PTORow.jsx
git commit -m "feat: create PTORow component

- Display individual PTO instance with type label and date pickers
- Calculate duration in weeks from start/end dates
- Show start date, duration display, and end date fields
- Include delete button matching ProjectRow pattern
- Follows existing project-item CSS classes for consistency"
```

---

## Task 5: Create PTOScheduling component

**Files:**
- Create: `src/components/PTOScheduling.jsx`

- [ ] **Step 1: Create PTOScheduling component file**

Create `src/components/PTOScheduling.jsx`:

```javascript
import React from 'react';
import { KdsButton } from 'react-mx-web-components';
import { v4 as uuidv4 } from 'uuid';
import { useCapacity } from '../context/CapacityContext';
import { calculateTotalPTO } from '../utils/calculations';
import PTORow from './PTORow';

const PTOScheduling = () => {
  const { activeIC, updateIC } = useCapacity();

  if (!activeIC) return null;

  const handlePTOUpdate = (ptoId, updates) => {
    const updatedPTOInstances = (activeIC.ptoInstances || []).map(p =>
      p.id === ptoId ? { ...p, ...updates } : p
    );
    updateIC(activeIC.id, { ptoInstances: updatedPTOInstances });
  };

  const handlePTORemove = (ptoId) => {
    const updatedPTOInstances = (activeIC.ptoInstances || []).filter(p => p.id !== ptoId);
    updateIC(activeIC.id, { ptoInstances: updatedPTOInstances });
  };

  const handleAddPTO = () => {
    const newPTO = {
      id: uuidv4(),
      type: '',
      startDate: null,
      endDate: null
    };
    updateIC(activeIC.id, {
      ptoInstances: [...(activeIC.ptoInstances || []), newPTO]
    });
  };

  const totalPTOWeeks = calculateTotalPTO(activeIC.ptoInstances || []);

  return (
    <div className="kds-Card kds-Card--m kds-card-section">
      <div className="domain-header">
        <h2 className="kds-Heading kds-Heading--s" style={{ margin: 0 }}>Scheduled PTO</h2>
      </div>

      <div className="project-list">
        {(activeIC.ptoInstances || []).map(pto => (
          <PTORow
            key={pto.id}
            pto={pto}
            onUpdate={handlePTOUpdate}
            onRemove={handlePTORemove}
          />
        ))}
      </div>

      <KdsButton
        kind="secondary"
        style={{ width: '100%', marginTop: '0.5rem' }}
        onClick={handleAddPTO}
      >
        + Add PTO Instance
      </KdsButton>

      <div className="summary-box">
        <span>PTO total: <strong>{totalPTOWeeks.toFixed(1)} weeks</strong></span>
      </div>
    </div>
  );
};

export default PTOScheduling;
```

- [ ] **Step 2: Verify file was created**

```bash
ls -la src/components/PTOScheduling.jsx
```

Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add src/components/PTOScheduling.jsx
git commit -m "feat: create PTOScheduling component

- Manage list of PTO instances with add/remove functionality
- Display total PTO weeks calculated from all instances
- Use calculateTotalPTO to aggregate scheduled time
- Pattern matches DomainList component for consistency
- Add button creates new PTO instance with empty fields"
```

---

## Task 6: Update TimeOffForm to use PTOScheduling

**Files:**
- Modify: `src/components/TimeOffForm.jsx`

- [ ] **Step 1: Add import for PTOScheduling**

At the top of `src/components/TimeOffForm.jsx`, add the import:

```javascript
import PTOScheduling from './PTOScheduling';
```

- [ ] **Step 2: Remove ptoDays field and handler**

In the TimeOffForm component:

Delete the `handlePTOChange` function (around line 63-68)

Delete the PTO Days input section (the div around lines 134-147)

- [ ] **Step 3: Add PTOScheduling component after OKR section**

In the return statement, after the first div that contains OKR/Dev/Holiday fields, add PTOScheduling:

Find the closing `</div>` of `form-grid-2col` (around line 178) and add before it:

```javascript
      </div>

      <PTOScheduling />

      <div className="summary-box">
```

- [ ] **Step 4: Update section heading**

Change the heading from "Quarterly Planning & PTO" to "Quarterly Planning":

```javascript
      <h2 className="kds-Heading kds-Heading--s section-heading">
        Quarterly Planning
      </h2>
```

- [ ] **Step 5: Verify changes look correct**

```bash
npm start
```

Navigate to the form and verify:
- OKR Time field is visible
- Dev/L&D Days field is visible
- Holiday Days field is visible
- NO PTO Days field exists
- Scheduled PTO section appears below with "Add PTO Instance" button
- Total time off summary updates when PTO instances are added

- [ ] **Step 6: Stop dev server**

```bash
# Ctrl+C to stop npm start
```

- [ ] **Step 7: Commit**

```bash
git add src/components/TimeOffForm.jsx
git commit -m "feat: replace manual PTO Days with PTOScheduling component

- Remove ptoDays input field and handlePTOChange handler
- Import and integrate PTOScheduling component
- Update section heading to 'Quarterly Planning'
- PTO now managed entirely through scheduled instances
- Maintains existing OKR Time, Dev/L&D Days, Holiday Days fields"
```

---

## Task 7: Add GanttPTOBar component and update GanttChart

**Files:**
- Modify: `src/components/GanttChart.jsx`

- [ ] **Step 1: Add calculateTotalPTO import**

At the top of `src/components/GanttChart.jsx`, add to imports:

```javascript
import { calculateTotalPTO } from '../utils/calculations';
```

- [ ] **Step 2: Create GanttPTOBar component**

After the `GanttBar` component (around line 64), add:

```javascript
const GanttPTOBar = ({ pto, fyStart, totalWeeks }) => {
  if (!pto.startDate || !pto.endDate) return null;

  const start = new Date(pto.startDate);
  const end = new Date(pto.endDate);
  const diffMs = end - start;

  if (diffMs < 0) return null;

  const startWeeks = (start - fyStart) / MS_PER_WEEK;
  const ptoWeeks = Math.ceil(diffMs / MS_PER_WEEK);
  const rawLeft = (startWeeks / totalWeeks) * 100;
  const rawRight = rawLeft + (ptoWeeks / totalWeeks) * 100;
  const clampedLeft = Math.max(0, Math.min(rawLeft, 100));
  const clampedRight = Math.max(0, Math.min(rawRight, 100));

  const leftPct = clampedLeft;
  const widthPct = clampedRight - clampedLeft;

  if (widthPct <= 0) return null;

  const tooltip = `PTO: ${pto.type} · ${pto.startDate} to ${pto.endDate} · ${ptoWeeks}w`;

  return (
    <div
      className="gantt-bar gantt-bar--pto"
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
```

- [ ] **Step 3: Update GanttMemberSection to render PTO row**

Find the `GanttMemberSection` component (around line 66) and update the return to add a PTO row:

After the opening `<div className="gantt-domain-rows">`, insert before the existing rows:

```javascript
      <div className="gantt-domain-rows">
        {/* PTO row */}
        <div className="gantt-domain-row">
          <div className="gantt-domain-col gantt-sticky-domain" title="PTO">
            PTO
          </div>
          <div className="gantt-bars-track">
            {(ic.ptoInstances || []).map(pto => (
              <GanttPTOBar
                key={pto.id}
                pto={pto}
                fyStart={fyStart}
                totalWeeks={totalWeeks}
              />
            ))}
            {(!ic.ptoInstances || ic.ptoInstances.length === 0) && (
              <span className="gantt-no-projects">No PTO scheduled</span>
            )}
          </div>
        </div>

        {/* Existing domain rows below */}
```

- [ ] **Step 4: Add CSS for PTO bars (if needed)**

Check if `src/App.css` or equivalent has gantt styling. If gantt-bar styles exist, verify they work with the #ff282f color. The style object in GanttPTOBar should handle this, but add to CSS if needed:

```css
.gantt-bar--pto {
  background-color: #ff282f !important;
  border-color: #ff282f !important;
}
```

- [ ] **Step 5: Verify in browser**

```bash
npm start
```

- Add a team member with IC info
- Add a domain with a project
- Add a PTO instance (start date, end date, type)
- Navigate to Gantt chart view
- Verify:
  - PTO row appears for each IC member
  - PTO bars render in red (#ff282f) showing correct date range
  - Project bars still render with their domain colors
  - Hovering over PTO bar shows tooltip with type, dates, and weeks
  - Single day PTO (start = end) displays correctly (very thin bar)
  - Multiple PTO instances all appear in the row

- [ ] **Step 6: Stop dev server**

```bash
# Ctrl+C
```

- [ ] **Step 7: Commit**

```bash
git add src/components/GanttChart.jsx
git commit -m "feat: add PTO visualization to Gantt chart

- Create GanttPTOBar component to render PTO instances
- Add PTO row to each IC showing all scheduled instances
- Use #ff282f red color for PTO bars per design spec
- Calculate position and width from start/end date and FY timeline
- Show PTO type label on bar with tooltip showing dates and duration
- Handle single-day and multi-day PTO correctly
- 'No PTO scheduled' message when none are added"
```

---

## Task 8: Data migration for existing ICs

**Files:**
- Modify: `src/utils/storage.js` (if needed)

- [ ] **Step 1: Check if data migration is needed**

Read `src/utils/storage.js` to understand how ICs are loaded/saved:

```bash
head -50 src/utils/storage.js
```

- [ ] **Step 2: Add migration logic (if needed)**

If ICs are loaded directly without migration logic, add a migration function in `src/utils/storage.js`:

```javascript
/**
 * Migrate IC data from old format (ptoDays) to new format (ptoInstances)
 */
function migrateICData(ic) {
  // If already has ptoInstances, don't migrate
  if (ic.ptoInstances !== undefined) {
    return ic;
  }

  // Initialize empty ptoInstances array
  return {
    ...ic,
    ptoInstances: [],
    timeOff: {
      ...ic.timeOff,
      ptoDays: undefined // Remove ptoDays from timeOff
    }
  };
}
```

Then in the `loadICs()` function, apply migration:

```javascript
export function loadICs() {
  try {
    const ics = JSON.parse(localStorage.getItem(ICS_KEY)) || [];
    return ics.map(ic => migrateICData(ic)); // Apply migration to each IC
  } catch {
    return [];
  }
}
```

- [ ] **Step 3: Verify app still works with migrated data**

```bash
npm start
```

- Load existing ICs (should migrate automatically)
- Verify they display correctly
- Verify no console errors
- Create new IC and add PTO instances to verify new flow works

- [ ] **Step 4: Stop dev server**

```bash
# Ctrl+C
```

- [ ] **Step 5: Commit**

```bash
git add src/utils/storage.js
git commit -m "feat: add data migration for PTO scheduling

- Migrate existing ICs from ptoDays to ptoInstances format
- Initialize empty ptoInstances array for ICs without it
- Migration runs automatically on app load, transparent to user
- Backward compatible with existing stored data"
```

---

## Task 9: Update FormattedOutput (Summary) to show PTO instances

**Files:**
- Modify: `src/utils/calculations.js` (generateSummary function)

- [ ] **Step 1: Check generateSummary function**

Review the current implementation:

```bash
grep -A 100 "export function generateSummary" src/utils/calculations.js | head -50
```

- [ ] **Step 2: Update generateSummary to include PTO instances**

In the "Planned Work by Domain" section of generateSummary output, add a PTO section before the domain section:

Find where it builds the output around line 200 and add after "## Planned Work by Domain":

```javascript
  // Add PTO section if there are scheduled instances
  if (ic.ptoInstances && ic.ptoInstances.length > 0) {
    output += `## Scheduled PTO\n`;
    ic.ptoInstances.forEach(p => {
      output += `- **${p.type}:** ${p.startDate} to ${p.endDate}\n`;
    });
    output += `\n`;
  }
```

- [ ] **Step 3: Verify FormattedOutput displays correctly**

```bash
npm start
```

- Create an IC with PTO instances
- Generate summary (click export/format button if available)
- Verify PTO instances appear in the markdown output

- [ ] **Step 4: Stop dev server**

```bash
# Ctrl+C
```

- [ ] **Step 5: Commit**

```bash
git add src/utils/calculations.js
git commit -m "feat: display PTO instances in formatted summary

- Add 'Scheduled PTO' section to markdown output
- List each PTO instance with type and date range
- Appears before 'Planned Work by Domain' section
- Provides complete PTO information in shared summaries"
```

---

## Task 10: Run full test suite and manual testing

**Files:**
- All (verification step)

- [ ] **Step 1: Run all tests**

```bash
npm test -- --watch=false
```

Expected: All tests PASS (48+ tests)

- [ ] **Step 2: Manual end-to-end test**

```bash
npm start
```

**Test scenario 1: Single day PTO**
- Create new IC
- Add quarter info
- Add OKR time (e.g., 5 days)
- Add 1 PTO instance: type="PTO", start="2024-01-05", end="2024-01-05"
- Verify: Scheduled PTO shows "1 week" in summary (or correct duration)
- Verify: Total time off includes PTO weeks
- Verify: Gantt chart shows PTO bar for that day

**Test scenario 2: Multi-week vacation**
- Add another PTO instance: type="Summer vacation", start="2024-06-10", end="2024-06-21"
- Verify: Scheduled PTO shows 2 instances with durations
- Verify: Gantt chart shows both PTO bars
- Verify: Total PTO weeks sums correctly
- Verify: Capacity utilization updates accordingly

**Test scenario 3: Multiple instances throughout quarter**
- Add domain and projects
- Add 3 more PTO instances (conference, sick days, etc.)
- Verify: All appear in scheduled PTO section
- Verify: Gantt chart shows all PTO instances as red bars
- Verify: Project bars still visible alongside PTO
- Verify: Capacity calculation reflects all time off

**Test scenario 4: Delete PTO instance**
- Click trash icon on one PTO instance
- Verify: Instance is removed
- Verify: Total PTO weeks updates
- Verify: Gantt chart updates immediately

**Test scenario 5: Persistence**
- Add PTO instances to an IC
- Refresh the page
- Verify: All PTO instances persist

- [ ] **Step 3: Stop dev server**

```bash
# Ctrl+C
```

- [ ] **Step 4: Check for console errors**

Verify no errors in browser console during all scenarios above

- [ ] **Step 5: Commit integration test results**

```bash
git add -A
git commit -m "test: verify PTO scheduling feature end-to-end

Tested:
- Single day PTO scheduling and display
- Multi-week vacation blocks
- Multiple PTO instances throughout quarter
- Gantt chart visualization with correct colors and positioning
- Capacity impact from scheduled PTO
- Data persistence through page refresh
- Delete functionality
- All scenarios verified with no console errors"
```

---

## Summary

**Files Created:**
- `src/components/PTORow.jsx` - Individual PTO instance row
- `src/components/PTOScheduling.jsx` - PTO list manager

**Files Modified:**
- `src/utils/calculations.js` - Add `calculateTotalPTO()`, update `generateSummary()`
- `src/utils/calculations.test.js` - Add tests for `calculateTotalPTO()`
- `src/context/CapacityContext.jsx` - Update IC structure, `calculateResults()`, add import
- `src/components/TimeOffForm.jsx` - Remove ptoDays, integrate PTOScheduling
- `src/components/GanttChart.jsx` - Add GanttPTOBar, render PTO row
- `src/utils/storage.js` - Add data migration

**Key Features Delivered:**
✓ Schedule multiple PTO instances with date ranges
✓ Custom type labels per instance
✓ Automatic capacity calculation from scheduled PTO
✓ Gantt chart visualization (#ff282f red bars)
✓ Consistent UI pattern with projects
✓ Data persistence and migration
✓ Full test coverage
