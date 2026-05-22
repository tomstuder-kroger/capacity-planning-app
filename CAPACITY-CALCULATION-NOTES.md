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

## Overlapping/Concurrent Projects with Split Focus

### Issue Discovered
**Date:** 2026-05-19

During team testing, users identified a gap in how the app handles concurrent/overlapping projects. Currently, there's no way to represent when an IC is working on multiple projects simultaneously with split focus/attention.

### Current Workaround

Team members are manually adding percentage annotations to project titles:
- Example: "Customer Portal Redesign - 60%"
- Example: "Bug Fixes - 40%"

This is a manual text-based hack with no calculation support.

### User Requirements

**1. Overlapping Definition**
- Multiple projects running in the SAME time period concurrently
- NOT projects with partial date overlap
- Same 2-week, 4-week, or 8-week period with 2+ projects in flight

**2. Focus Allocation Percentages**
- Team members estimate % of attention on each concurrent project
- Example: "Project A: 60% of my time, Project B: 40% of my time for weeks 3-6"
- Percentages MUST sum to 100% across all overlapping work
- This is a SWAG/ballpark estimation (not precise tracking)

**3. Time vs Focus Distinction - CRITICAL UNDERSTANDING**
- Projects still take their standard duration (Small=2w, Medium=4w, Large=8w)
- The percentage represents **FOCUS/ATTENTION split**, not time extension
- Reality: "This Large project is 8 weeks of work but I'm only giving it 50% attention, so it'll take 16 calendar weeks"

**4. Desired Output Format**

Team wants to see in the summary:
```
Project Name: "Title"
  Size: Medium
  Date start & end: [dates]
  Focus: 60%

Project Name: "Title"
  Size: Small
  Date start & end: [dates]
  Focus: 40%
```

### Open Question: What Problem Does Percentage Tracking Solve?

**Option A: Calendar/Timeline Realism** 🕒
- **Problem:** "I have 4 weeks available, but I'm running 2 Medium projects (8 weeks of work total) concurrently because I'm splitting my time"
- **Current behavior:** 8 weeks planned, 4 weeks available = 200% utilization ❌ WRONG
- **Reality:** Both will complete in 4 weeks because they're parallel
- **Fix needed:** Adjust calculation logic so concurrent projects don't over-count capacity

**Option B: Communication/Documentation Only** 📄
- **Problem:** Stakeholders/managers need visibility into multitasking
- **Current behavior:** The math is actually correct (8 weeks of effort squeezed into 4 weeks IS overallocated)
- **Reality:** IC is intentionally choosing to multitask and accepts the tradeoffs
- **Fix needed:** Just display the percentages in the summary for transparency (no calc changes)

**Option C: Capacity Risk Assessment** ⚠️
- **Problem:** Want to visualize when someone is juggling too many things
- **Current behavior:** No way to flag high-risk scenarios
- **Reality:** Splitting focus across projects increases risk/reduces throughput
- **Fix needed:** Add warnings/indicators when total concurrent projects exceed thresholds

### Potential Implementation Approaches

**If Option A (Adjust Calculations):**
- **UI Changes Needed:**
  - Add percentage input per project
  - Add date range inputs (start/end) per project
  - Concurrent project detection logic
- **Calculation Changes:**
  - Identify projects with overlapping date ranges
  - Apply percentage multipliers to project sizes
  - OR: Calculate effective calendar weeks instead of effort weeks
- **Data Structure:**
  ```javascript
  {
    title: "Customer Portal",
    size: "medium", // 4 weeks base
    focusPercentage: 60,
    startDate: "2026-Q2-W1",
    endDate: "2026-Q2-W4"
  }
  ```

**If Option B (Display Only):**
- **UI Changes Needed:**
  - Add optional percentage input per project
  - No calculation changes
- **Summary Output Changes:**
  - Show focus % alongside project details
  - Keep current utilization calculations unchanged

**If Option C (Risk Assessment):**
- **UI Changes Needed:**
  - Same as Option A (need overlapping detection)
- **Calculation Changes:**
  - Add "multitasking factor" or "complexity score"
  - Flag scenarios where concurrent projects > X
  - Potentially adjust utilization thresholds

### Implications for Current Methodology

**From CLAUDE.md - Current calculation:**
1. Total Available = Weeks in quarter - Total time off
2. Domain Effort = (Small × 2) + (Medium × 4) + (Large × 8) weeks
3. Total Planned = Sum of all domain efforts
4. Utilization = (Total planned / Total available) × 100

**Potential conflict if Option A chosen:**
- Current methodology assumes **sequential work** (one thing at a time)
- Overlapping projects with split focus implies **concurrent work**
- Need to clarify: Does a 60% focus on a Medium project count as 2.4 weeks or 4 weeks?

### Testing Scenarios to Validate

Once approach is decided, test these scenarios:

1. **100% focus single project** (baseline - should match current behavior)
2. **Two 50/50 concurrent projects** (same size, same duration)
3. **Three-way split** (33/33/34)
4. **Uneven split** (70/30)
5. **Partial overlap** (Project A weeks 1-4, Project B weeks 3-6, overlap weeks 3-4)
6. **Projects in different domains** (Customer 60%, Platform 40%)

### Decision

**Status:** In Progress - Awaiting user decision on Option A, B, C, or combination

### Notes

- User must choose which problem they're solving before implementation can begin
- The three options have very different implications for UI and calculation complexity
- Current workaround (manual text in title) suggests low urgency for full implementation
