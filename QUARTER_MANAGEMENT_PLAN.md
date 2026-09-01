# Quarter-Based Project Management Implementation Plan

## Context

The user is now in Q3 and needs to plan Q3 work for their team members. Currently, when viewing an individual team member's planning interface (PlanningView.jsx), all projects from previous quarters (Q2) remain visible in the "Domains & Planned Work" section. This creates a workflow problem:

1. **Overwriting Q2 data** - Users lose historical record of what was planned in Q2
2. **Appending to Q2 data** - Q3 projects mix with Q2 projects, creating clutter and confusion about which projects belong to which quarter

**Root Cause**: The current architecture stores each IC with a single `quarter` field and flat `domains[]` and `ptoInstances[]` arrays with no quarter scoping. When moving from Q2 to Q3, there's no way to preserve Q2 data while planning Q3 work.

**Goal**: Add multi-quarter support with historical preservation and future forecasting, allowing users to:
- Plan work for ANY quarter (past, current, or future) without data loss
- Work on Q3, Q4, and Q1 FY2027 simultaneously
- Forecast future quarter capacity (e.g., plan Q4 work while still in Q3)
- Always report current quarter capacity % on team dashboard (based on today's fiscal period)
- View capacity projections for future quarters
- Switch between quarters to view/edit different planning periods
- Copy data from previous quarters to accelerate planning
- Maintain clear separation between quarters

## Recommended Approach: Quarter-Scoped Data Snapshots

Restructure each IC object to contain a `quarterData` object where each key is a quarter identifier (e.g., "Q3 FY2026") and the value is a complete snapshot of that quarter's planning data (timeOff, ptoInstances, domains, projects).

### New IC Data Structure

```javascript
{
  id: uuidv4(),
  icName: 'Jane Smith',
  icRole: 'Senior Engineer',
  activeQuarter: 'Q3 FY2026',  // Currently selected quarter for editing
  quarterData: {
    'Q2 FY2026': {
      quarter: 'Q2 FY2026',
      weeksInQuarter: 12,
      timeOff: { okrTime: {...}, devDays: 2, holidayDays: 1 },
      ptoInstances: [...],
      domains: [...]
    },
    'Q3 FY2026': {
      quarter: 'Q3 FY2026',
      weeksInQuarter: 12,
      timeOff: { okrTime: {...}, devDays: 1, holidayDays: 0 },
      ptoInstances: [...],
      domains: [...]
    }
  },
  lastModified: '2026-08-18T...'
}
```

**Key Insight**: Each quarter is completely isolated. Switching quarters changes what data is visible/editable, but previous quarters remain preserved.

### Critical Architectural Decision: Current Quarter vs Active Quarter

The system needs to distinguish between TWO different quarter concepts:

1. **Current Quarter** (Reporting Context)
   - Determined by today's date via `getCurrentFiscalPeriod()`
   - Used for capacity reporting on TeamDashboard
   - Example: Today is Aug 18, 2026 → Current Quarter = "Q3 FY2026"
   - Team capacity metrics (Total Available, Team Capacity %) always show Q3
   - Never changes based on user selection

2. **Active Quarter** (Editing Context)
   - Stored per IC as `ic.activeQuarter`
   - Represents which quarter the user is currently planning/editing
   - Can be past (Q2), current (Q3), or future (Q4, Q1 FY2027)
   - Example: While in Q3, user can plan Q4 work by setting activeQuarter = "Q4 FY2026"
   - PlanningView shows capacity for this quarter

**Implementation Pattern**:
```javascript
// TeamDashboard - ALWAYS use current quarter for reporting
const currentPeriod = getCurrentFiscalPeriod();
const currentQuarter = `${currentPeriod.quarter} FY${currentPeriod.fiscalYear}`;
const teamCapacity = calculateResults(ic, currentQuarter); // Explicit

// PlanningView - Use active quarter for editing
const planningCapacity = calculateResults(activeIC); // Uses ic.activeQuarter by default
```

**User Experience**:
- TeamDashboard header: "Q3 FY2026 (Current)" with 13 weeks, Team Capacity 85%
- User clicks on team member card → PlanningView opens
- QuarterInfoForm shows: "Planning Quarter: [Q4 FY2026 ▼]"
- User is planning Q4 while Q3 is still the current fiscal quarter
- PlanningView capacity dashboard shows Q4 capacity (could be 120% - overbooked forecast)
- But TeamDashboard still shows Q3 capacity (actual current quarter)

## Implementation Steps

### 1. Data Migration (storage.js)

**File**: `src/utils/storage.js`

Add `migrateQuarterData()` function that:
- Checks if IC already has `quarterData` (skip if already migrated)
- Takes existing flat structure (`quarter`, `weeksInQuarter`, `timeOff`, `ptoInstances`, `domains`)
- Wraps it in `quarterData[currentQuarter]`
- Sets `activeQuarter` to current quarter
- Removes old top-level fields

Update `loadICs()` to apply this migration to all ICs on load, with error handling to prevent data loss if migration fails.

Apply `migrateProjectData()` to all projects within all quarters to ensure allocation percentage fields are present.

### 2. Context Updates (CapacityContext.jsx)

**File**: `src/context/CapacityContext.jsx`

**Update `createEmptyIC()`**:
- Initialize with `activeQuarter` set to current fiscal period
- Initialize `quarterData` with one entry for current quarter
- Structure: `quarterData[currentQuarter] = { quarter, weeksInQuarter, timeOff, ptoInstances, domains }`

**Update `updateIC()`**:
- Handle `activeQuarter` changes separately (just update activeQuarter field)
- Handle top-level IC field updates (icName, icRole) normally
- Route all quarter-specific updates to `quarterData[activeQuarter]`
- Example: `updateIC(id, { timeOff: {...} })` should update `ic.quarterData[ic.activeQuarter].timeOff`

**Add new methods**:
- `setActiveQuarter(icId, quarter)` - Switch which quarter is active for editing
- `createQuarter(icId, quarter, copyFromQuarter)` - Initialize new quarter, optionally copying structure from previous quarter
- `getAvailableQuarters(ic)` - Return array of quarter keys from `ic.quarterData`

**Update `calculateResults(ic, quarterKey)`**:
- Accept optional `quarterKey` parameter to calculate for specific quarter
- If `quarterKey` provided, use it (e.g., current quarter for dashboard reporting)
- If not provided, default to `ic.activeQuarter` (for editing view)
- Extract quarter data: `const quarter = quarterKey || ic.activeQuarter; const quarterData = ic.quarterData?.[quarter]`
- Run all calculations using `quarterData` instead of top-level IC fields
- If no quarterData, return null (defensive programming)

**Key Insight**: This separation allows:
- TeamDashboard to always show CURRENT quarter capacity (pass current quarter explicitly)
- PlanningView to show capacity for the quarter being edited (use default activeQuarter)
- Future quarter forecasting (pass Q4 quarter key while in Q3)

**Export new methods in context value**:
```javascript
const value = {
  // ... existing exports
  setActiveQuarter,
  createQuarter,
  getAvailableQuarters
};
```

### 3. Quarter Selector UI (QuarterInfoForm.jsx)

**File**: `src/components/QuarterInfoForm.jsx`

Replace current read-only quarter display with:
- **Quarter selector dropdown**: Shows available quarters (from `getAvailableQuarters(activeIC)`)
- **"+ New Quarter" button**: Opens CreateQuarterModal
- **Visual indicator**: Show "(Current)" next to the current fiscal period in dropdown

Layout:
```
┌────────────────────────────────────────────────┐
│ Jane Smith                                     │
│ Senior Engineer                                │
│                         Planning Quarter       │
│                    [Q3 FY2026 ▼] [+ New Quarter]│
│                         Weeks: 12w             │
└────────────────────────────────────────────────┘
```

Remove the `useEffect` that auto-updates quarter field (lines 10-19) since we now support multiple quarters explicitly.

### 4. Create Quarter Modal (CreateQuarterModal.jsx)

**New File**: `src/components/CreateQuarterModal.jsx`

Modal with:
- **Quarter name input**: Pre-populated with suggested next quarter (Q4 FY2026 if currently Q3 FY2026)
- **"Copy from" dropdown**: List of existing quarters + "Start fresh (empty)"
- **Copy options checkboxes** (if copying):
  - Copy time off settings
  - Copy domain structure (but not projects)

On submit: Call `createQuarter(ic.id, quarterName, copyFromQuarter)` and close modal.

Suggestion logic for next quarter:
- Q1 → Q2, Q2 → Q3, Q3 → Q4, Q4 → Q1 (increment fiscal year)

### 5. Form Component Updates

**Files**: `TimeOffForm.jsx`, `DomainList.jsx`, `PTOScheduling.jsx`

These components should mostly work without changes since they use `updateIC()` which now routes to active quarter automatically.

**Add defensive checks**:
```javascript
const quarterData = activeIC.quarterData?.[activeIC.activeQuarter];
if (!quarterData) {
  return <div>No data for selected quarter. Please create a quarter first.</div>;
}
```

Use `quarterData` to access time off, domains, and PTO instances instead of top-level `activeIC` fields.

### 6. Dashboard Updates (TeamDashboard.jsx, MemberListView.jsx)

**Files**: `src/components/TeamDashboard.jsx`, `src/components/MemberListView.jsx`

**Critical Change**: Dashboard must ALWAYS show current quarter capacity, not the quarter being edited.

**TeamDashboard.jsx**:
```javascript
const currentPeriod = getCurrentFiscalPeriod();
const currentQuarter = `${currentPeriod.quarter} FY${currentPeriod.fiscalYear}`;

// Calculate totals for CURRENT quarter only
const { totalAvailable, totalPlanned } = ics.reduce((acc, ic) => {
  const result = calculateResults(ic, currentQuarter); // Pass current quarter explicitly
  // ... rest of calculation
}, { totalAvailable: 0, totalPlanned: 0 });
```

**Display**:
- Team capacity metrics (Total Available, Total Planned, Team Capacity %) → Current quarter only
- Quarter indicator showing "Q3 FY2026" with "(Current)" label
- Individual cards show which quarter they're editing (if different from current)

**MemberListView.jsx**:
- Gantt chart can show multiple quarters (current + future)
- But utilization % shown should be for current quarter by default
- Consider adding toggle to view future quarter projections

## Critical Files to Modify

1. `/Users/ts73344/Desktop/claudeTest/capacity-planning-app/src/utils/storage.js`
   - Add `migrateQuarterData()` function
   - Update `loadICs()` to apply migration

2. `/Users/ts73344/Desktop/claudeTest/capacity-planning-app/src/context/CapacityContext.jsx`
   - Update `createEmptyIC()` to use quarterData structure
   - Update `updateIC()` to route to active quarter
   - Add `setActiveQuarter()`, `createQuarter()`, `getAvailableQuarters()` methods
   - Update `calculateResults()` to use quarterData
   - Export new methods in context value

3. `/Users/ts73344/Desktop/claudeTest/capacity-planning-app/src/components/QuarterInfoForm.jsx`
   - Add quarter selector dropdown
   - Add "+ New Quarter" button
   - Remove auto-update useEffect
   - Show active quarter name and weeks

4. `/Users/ts73344/Desktop/claudeTest/capacity-planning-app/src/components/CreateQuarterModal.jsx` (NEW FILE)
   - Modal for creating new quarters
   - Quarter name input with auto-suggestion
   - Copy-from dropdown
   - Copy options checkboxes

5. `/Users/ts73344/Desktop/claudeTest/capacity-planning-app/src/components/TimeOffForm.jsx`
   - Add defensive check for quarterData
   - Access time off from quarterData

6. `/Users/ts73344/Desktop/claudeTest/capacity-planning-app/src/components/DomainList.jsx`
   - Add defensive check for quarterData
   - Access domains from quarterData

7. `/Users/ts73344/Desktop/claudeTest/capacity-planning-app/src/components/PTOScheduling.jsx`
   - Add defensive check for quarterData
   - Access ptoInstances from quarterData

## Verification Strategy

### Unit Tests
1. Test `migrateQuarterData()` with existing IC structure → verify correct transformation
2. Test `createEmptyIC()` → verify quarterData initialized with current quarter
3. Test `updateIC()` with quarter-specific data → verify routed to active quarter
4. Test `setActiveQuarter()` → verify activeQuarter field updated
5. Test `createQuarter()` → verify new quarter added to quarterData
6. Test `calculateResults()` with quarterData structure → verify calculations work correctly

### Integration Tests
1. Load app with existing Q2 data → verify migration runs successfully, Q2 data preserved in quarterData['Q2 FY2026']
2. Create new IC → verify quarterData initialized with current quarter
3. Switch quarters → verify context updates, form fields show correct quarter data
4. Create new quarter (Q3) → verify Q2 data unchanged, Q3 data independent
5. Create Q3 from Q2 with "copy domains" → verify domain structure copied, projects NOT copied
6. Export/import → verify quarterData structure preserved

### Manual End-to-End Testing
1. **Fresh install**: Create new IC → verify normal operation
2. **Migration test**: Refresh page with existing Q2 data → verify data migrates to quarterData['Q2 FY2026'], no data loss
3. **Create Q3**: Click "+ New Quarter" → enter "Q3 FY2026" → copy from Q2 → verify time off copied, domains copied (without projects)
4. **Add Q3 projects**: Add projects to Q3 → verify Q2 projects unchanged
5. **Switch to Q2**: Select Q2 from dropdown → verify Q2 data shows, Q3 data hidden
6. **Switch back to Q3**: Select Q3 from dropdown → verify Q3 data shows with projects added earlier
7. **Dashboard view**: View team dashboard → verify utilization shows for active quarter only
8. **Storage size**: Check localStorage size with 4 quarters → verify under 10MB limit

### Test Commands
```bash
# Start dev server
npm start

# Run tests (if unit tests are added)
npm test -- --watchAll=false

# Production build test
npm run build
```

## Migration Safety

The migration is backward compatible:
- Existing single-quarter data moves to `quarterData[currentQuarter]`
- If migration fails for one IC, that IC returns unchanged (no data loss)
- If entire migration fails, fallback returns raw data
- localStorage is never cleared on error

## Trade-offs

**Pros**:
- Complete quarter isolation (no data mixing)
- Historical data fully preserved
- Natural "copy from previous quarter" workflow
- Clean mental model for users
- Easy quarter comparison in future

**Cons**:
- Increases localStorage size (manageable: ~4MB for 4 quarters × 20 team members)
- More complex context state (activeIC + activeQuarter)
- Quarter selector needed in multiple components

**Development Effort**: ~26 hours (3-4 days)

## Future Enhancements (Not in Scope for Initial Implementation)

### Phase 2 Enhancements:
- **Multi-quarter forecast view**: Table showing Q3, Q4, Q1 FY2027 capacity side-by-side
- **Quarter selector on team dashboard cards**: Switch which quarter to view per team member on dashboard
- **Forecast mode toggle**: Switch team dashboard between "Current Quarter" and "Forecast View"
- **Quarter-to-quarter comparison**: Visual diff showing changes between quarters
- **Bulk quarter operations**: Create Q4 for all team members at once
- **Project carry-over detection**: Flag projects that span multiple quarters
- **Capacity trending**: Graph showing capacity % across Q1, Q2, Q3, Q4

### Phase 3 Enhancements:
- **Archive old quarters**: Move quarters older than 2 fiscal years to separate storage
- **Copy individual projects between quarters**: Drag-and-drop projects from Q3 to Q4
- **Quarterly reports**: Export PDF showing capacity history and forecasts
- **Team-level forecasting**: Aggregate forecast view for entire team across quarters
