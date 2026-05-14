# Capacity Calculation Notes

## Multi-Quarter Project Handling

### Issue Discovered
**Date:** 2026-05-14

The current capacity calculation counts the **total duration** of each project, regardless of whether the project spans multiple quarters. This can lead to inaccurate quarterly capacity planning.

### Current Behavior

When a project has:
- Start Date: 04/20/2026 (Q2)
- Duration: 4 weeks
- End Date: 05/18/2026 (Q2)

The system correctly calculates 4 weeks.

However, when a project spans quarters:
- Start Date: 01/15/2026 (Q1)
- Duration: 8 weeks
- End Date: 03/12/2026 (potentially into Q2)

The system counts **all 8 weeks** against whichever quarter the IC is currently planning for, rather than calculating the intersection with the quarter's boundaries.

### Expected Behavior (Not Implemented)

For accurate quarterly capacity planning, the system should:
1. Determine the current quarter's start and end dates
2. Calculate the **intersection** between each project's date range and the quarter's date range
3. Count only the weeks that fall within the current quarter's boundaries

**Example:**
- Quarter: Q2 FY2026 (starts 02/01/2026, 13 weeks)
- Project: Starts 01/20/2026, 8 weeks duration (ends ~03/17/2026)
- **Should count:** ~6 weeks (only the portion in Q2)
- **Currently counts:** 8 weeks (entire project duration)

### Code Locations

**Current Implementation:**
- `src/utils/calculations.js:37-49` - `getProjectWeeks(project)` function
  - Returns total project duration from start to end date
  - Does NOT consider quarter boundaries

**Called From:**
- `src/context/CapacityContext.jsx:199` - `calculateResults()` function
  - Processes all projects and sums weeks per domain

**Available Infrastructure:**
- `src/utils/fiscalCalendar.js:81-102` - `getQuarterStartDate(fiscalYear, quarter)`
  - Can get quarter start date from fiscal calendar
- `src/utils/fiscalCalendar.js:65-68` - `getQuarterWeeks(fiscalYear, quarter)`
  - Can get number of weeks in quarter
- Quarter end date can be calculated from start + weeks

**IC Data Structure:**
- `ic.quarter` - e.g., "Q2 2026"
- `ic.weeksInQuarter` - e.g., 13
- `project.startDate` - ISO date string
- `project.customEndDate` - ISO date string (for custom mode)
- `project.weeks` - number (for fixed mode)

### Potential Implementation Approach

If this needs to be fixed in the future:

1. **Update `getProjectWeeks` signature:**
   ```javascript
   getProjectWeeks(project, quarterStartDate, quarterEndDate)
   ```

2. **Add date range intersection logic:**
   - Calculate project end date (start + weeks OR customEndDate)
   - Find overlap between [projectStart, projectEnd] and [quarterStart, quarterEnd]
   - Return weeks in overlapping range only

3. **Update `calculateResults` in CapacityContext:**
   - Parse `ic.quarter` to extract fiscal year and quarter
   - Call `getQuarterStartDate()` to get quarter boundaries
   - Pass quarter dates to `getProjectWeeks()`

4. **Edge Cases to Handle:**
   - Projects entirely before the quarter (0 weeks)
   - Projects entirely after the quarter (0 weeks)
   - Projects with no dates set (current behavior)
   - Fixed-duration projects without start dates (how to handle?)

### Decision

**Status:** Not implementing at this time

The team is aware of this limitation. The current simplified approach is acceptable for the current use case.

### Notes

- Projects can use either "fixed" mode (1-13 weeks dropdown) or "custom" mode (date range)
- Fixed mode projects don't have an end date, only a start date and week count
- The methodology assumes projects are scoped per quarter, so this may be less of an issue in practice
- If multi-quarter projects become common, this should be revisited
