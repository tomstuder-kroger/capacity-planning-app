# PTO Scheduling Feature Design

## Overview
Transform PTO time tracking from aggregate "PTO Days" input to scheduled instances with calendar-based date ranges. Users can define multiple PTO periods throughout a quarter (1 day, week, multiple weeks), see them visualized in the Gantt chart, and have capacity calculated automatically based on total scheduled time off.

---

## User Stories

1. **Single PTO Day:** As a user, I can schedule a single day of PTO (start date = end date) and see it appear in the Gantt chart
2. **Multiple PTO Instances:** As a user, I can schedule multiple PTO instances throughout the quarter (e.g., 1 week in Jan, 3 days in March, 1 week in May)
3. **Custom PTO Types:** As a user, I can label each PTO instance with a custom type (PTO, Summer vacation, Conference, Health & Wellness, etc.)
4. **Calendar-based Selection:** As a user, I can use a calendar picker to select start and end dates for each PTO instance
5. **Gantt Visualization:** As a user, I can see all scheduled PTO instances in the Gantt chart as colored blocks (#ff282f red)
6. **Automatic Capacity Impact:** As a user, the total capacity utilization is automatically updated based on my scheduled PTO instances

---

## Data Structure

### IC PTO Instance Object
```javascript
{
  id: "uuid",
  startDate: "2024-01-05",      // ISO format
  endDate: "2024-01-07",        // ISO format
  type: "Summer vacation",       // Custom label, user-defined
  createdAt: "2024-04-30T..."
}
```

### Updated IC Data Structure
**Remove from `timeOff` object:**
- `ptoDays: number` (no longer used)

**Add to IC root:**
```javascript
{
  ...existing fields,
  ptoInstances: [
    { id, startDate, endDate, type },
    { id, startDate, endDate, type }
  ]
}
```

---

## Component Architecture

### 1. PTOScheduling Component (New)
**Location:** `src/components/PTOScheduling.jsx`

**Responsibilities:**
- Display list of scheduled PTO instances
- Allow adding new instances
- Allow editing existing instances
- Allow deleting instances
- Show total scheduled PTO time in weeks
- Use calendar picker for date selection

**Props:** None (reads from context: `activeIC`, `updateIC`)

**Key Features:**
- Add button triggers a form/modal
- Each instance shows: date range, type, duration in weeks
- Delete button per instance (with confirmation)
- Summary: "Total PTO scheduled: X.X weeks"

### 2. PTORow Component (New)
**Location:** `src/components/PTORow.jsx`

**Responsibilities (matches ProjectRow pattern):**
- Display a single PTO instance
- Type label input (text field for custom labels)
- Start Date picker
- Duration display (calculated from dates)
- End Date picker
- Delete button (trash icon)
- Similar styling/layout to ProjectRow

**UI Pattern:**
```
┌─ PTO ────────────────────────────────┐
│ Type: [Summer vacation          ]  [x]
│
│ Start Date: [Jan 5   ]
│ Duration:   [2 weeks] (calculated)
│ End Date:   [Jan 7   ]
└──────────────────────────────────────┘
```

### 3. GanttChart Updates
**Location:** `src/components/GanttChart.jsx`

**Changes:**
- Add `GanttPTOBar` component (similar to `GanttBar` for projects)
- Render PTO instances for each IC member
- Color: #ff282f (red)
- Tooltip: "PTO: [type] · [dates] · X weeks"
- Position in Gantt row between domain rows (or as a separate row per IC)

---

## Calculation Updates

### calculateTotalPTO (New Function)
**Location:** `src/utils/calculations.js`

```javascript
export function calculateTotalPTO(ptoInstances) {
  if (!Array.isArray(ptoInstances)) return 0;

  return ptoInstances.reduce((total, instance) => {
    if (!instance.startDate || !instance.endDate) return total;

    const start = new Date(instance.startDate);
    const end = new Date(instance.endDate);
    const diffMs = end - start;

    if (diffMs < 0) return total; // Invalid range

    const weeks = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
    return total + weeks;
  }, 0);
}
```

### Updated TimeOffForm Calculation
**Location:** `src/context/CapacityContext.jsx` → `calculateTimeOff()`

Current logic:
```javascript
totalTimeOff = okrWeeks + (pto + dev + holiday) / 5
```

Updated logic:
```javascript
// pto now comes from ptoInstances instead of ptoDays
const ptoWeeks = calculateTotalPTO(ic.ptoInstances);
totalTimeOff = okrWeeks + ptoWeeks + (dev + holiday) / 5
```

---

## UI Layout

### TimeOffForm (Updated)
```
┌─────────────────────────────────┐
│ Quarterly Planning              │
├─────────────────────────────────┤
│ OKR Time        [5] ◉ Days      │
│                 ○ Weeks         │
│ Dev/L&D Days    [2]             │
│ Holiday Days    [1]             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Scheduled PTO                   │
├─────────────────────────────────┤
│ PTO Instance                    │
│ Type: [Summer vacation    ]  [x]│
│ Start: [Jan 5 ] Duration: [2w]  │
│ End:   [Jan 7 ]                 │
│                                 │
│ PTO Instance                    │
│ Type: [Conference        ]  [x]│
│ Start: [Mar 10] Duration: [2d]  │
│ End:   [Mar 12]                 │
│                                 │
│ + Add PTO Instance              │
│                                 │
│ Domain total: 2.5 weeks         │
└─────────────────────────────────┘

Total time off: [X.X] weeks
```

### Gantt Chart (Updated)
For each IC, add a "PTO" row that shows all scheduled instances:
```
Sarah Chen
├─ PTO
│  [█ Summer vac]  [█ Conference]  [█ PTO]
├─ Platform
│  [project bars]
└─ Data Infra
   [project bars]
```

---

## Validation & Error Handling

1. **Date Range:** `startDate` must be ≤ `endDate`
2. **Type Field:** Required, min 1 char, max 50 chars
3. **Date Overlap:** Allow (user can schedule overlapping PTO if needed)
4. **Quarter Bounds:** Allow PTO outside quarter dates (user's responsibility)

---

## Storage & Persistence

- PTO instances stored in IC object as `ptoInstances` array
- Auto-save to localStorage (existing debounce mechanism)
- Summary output (FormattedOutput) should list scheduled PTO instances

---

## Migration Path

- Users with existing "PTO Days" will see them cleared when feature launches
- Option to preserve via data migration if needed (TBD with product)
- Recommend documenting this in release notes

---

## Success Criteria

- ✓ User can add 1-N PTO instances with start/end dates
- ✓ Each instance has a custom type label
- ✓ Total PTO weeks calculated and reflected in capacity %
- ✓ All PTO instances render in Gantt chart (red #ff282f color)
- ✓ Single day PTO (start = end) works correctly
- ✓ Multiple instances throughout quarter aggregate correctly
- ✓ Data persists to localStorage
- ✓ Capacity calculations update in real-time

---

## Open Questions / Future Considerations

1. Should we allow editing PTO instances or only add/delete?
2. Should there be a "PTO type" preset list with suggestions (Summer, Conference, Sick, etc.)?
3. Should recurring PTO (e.g., every Friday off) be supported?
4. Should PTO instances affect individual project capacity or just overall IC capacity?
