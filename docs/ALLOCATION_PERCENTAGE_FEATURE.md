# Allocation Percentage & Capacity Conflict Detection

**Feature Release:** Q2 2026
**Branch:** `improve-capacity-calculation`
**Status:** ✅ Implemented & Tested

---

## Overview

This feature adds **allocation percentage tracking** and **capacity conflict detection** to the capacity planning tool, enabling accurate capacity calculations for team members working on multiple projects simultaneously.

### The Problem

The previous system calculated capacity utilization based solely on project duration, assuming 100% focus on each project. This resulted in unrealistic over-capacity calculations (often 200-400%) because designers work on multiple projects concurrently with varying levels of focus.

**Example (Before):**
- Project A: 4 weeks duration
- Project B: 2 weeks duration (overlapping with Project A)
- **Total Planned:** 6 weeks
- **Result:** Appears as 6 weeks of work, even if both are part-time

### The Solution

Projects now track both **duration** (calendar time) and **allocation percentage** (% of capacity dedicated), allowing the system to calculate **capacity consumed**:

```
Capacity Consumed = Project Duration × Allocation %
```

**Example (After):**
- Project A: 4 weeks @ 75% allocation = **3.0 weeks capacity**
- Project B: 2 weeks @ 50% allocation = **1.0 weeks capacity**
- **Total Capacity:** 4.0 weeks
- **Result:** Accurate representation of actual work capacity

---

## What's New

### 1. Allocation Percentage Field

Each project now has an **Allocation %** input field:
- Range: 0-100%
- Default: 100% (full-time focus)
- Step: 5% increments
- Purpose: Track percentage of time dedicated to this project

**Use Cases:**
- **100%** = Full-time focus on one project
- **50%** = Half-time (working on project ~2.5 days/week)
- **25%** = Quarter-time (working on project ~1-2 days/week)
- **10%** = Minimal involvement (check-ins, reviews, advisory)

### 2. Story Points Field

Optional reference field for Scrum teams:
- Does NOT affect capacity calculations
- Useful for tracking complexity
- Future-ready for Jira integration (stories, epics, spikes)
- Displayed in summaries and project forms

### 3. Capacity Consumed Calculation

The system now calculates **actual capacity consumed** instead of just summing durations:

**Calculation Logic:**
```javascript
// Per project
projectCapacity = projectDuration × (allocationPercent / 100)

// Per domain
domainCapacity = sum of all project capacities in domain

// Total planned work
totalPlanned = sum of all domain capacities
```

**Example:**
- Project 1: 4 weeks @ 75% = 3.0 weeks capacity
- Project 2: 2 weeks @ 50% = 1.0 weeks capacity
- Project 3: 3 weeks @ 25% = 0.75 weeks capacity
- **Total:** 4.75 weeks capacity consumed

### 4. Conflict Detection

Automatically detects when overlapping projects exceed 100% allocation:

**Detection Algorithm:**
- Timeline sweep algorithm
- Identifies overlapping project date ranges
- Calculates total allocation during overlap periods
- Flags conflicts when total > 100%

**Example Conflict:**
- Project A: Jan 1-14 @ 75% allocation
- Project B: Jan 8-21 @ 45% allocation
- **Overlap:** Jan 8-14 has 120% allocation (75% + 45%)
- **Result:** ⚠️ Conflict detected

### 5. Visual Indicators

**Gantt Chart Enhancements:**
- Allocation percentage displayed on project bars: `"Project A (75%)"`
- Conflicting projects highlighted with red borders (2px)
- Red shadow effect on conflicts for emphasis
- Tooltips include allocation percentage

**Conflict Warning Banner:**
- Appears above Gantt chart when conflicts exist
- Shows concise summary: `"Colin Johnston has 3 conflicts (up to 400% allocated)"`
- Directs users to red-bordered projects for details

**Dashboard Updates:**
- "Planned" field shows capacity consumed (not just duration)
- Utilization percentage based on actual capacity
- Realistic metrics (e.g., 91% instead of 337%)

### 6. Enhanced Summary Output

Summary now includes allocation details:

```markdown
## Planned Work by Domain
- **API Design:** 4.0 weeks capacity
  - **Project Alpha:** 4 weeks @ 75% allocation = 3.0 weeks capacity (Story Points: 8)
  - **Project Beta:** 2 weeks @ 50% allocation = 1.0 weeks capacity (Story Points: 5)
```

---

## How to Use

### Adding Allocation Percentage to Projects

1. **Create or edit a project** in any domain
2. **Find the "Allocation %" field** (next to Duration)
3. **Enter the percentage** of time dedicated to this project
   - Use 100% for full-time focus
   - Use 50% for half-time work
   - Use 25% for quarter-time involvement
4. **See live capacity calculation** below the form:
   - Example: `4w @ 75% = 3.0w capacity`

### Adding Story Points (Optional)

1. **Find the "Story Pts" field** next to Allocation %
2. **Enter the story point value** for complexity reference
3. Story points appear in summaries but don't affect calculations

### Viewing Capacity Conflicts

1. **Navigate to Gantt chart** view
2. **Look for the red warning banner** if conflicts exist:
   - Shows which team members have conflicts
   - Shows maximum allocation percentage
3. **Find red-bordered projects** in the chart
   - These are the projects involved in conflicts
4. **Hover over projects** to see allocation details in tooltips

### Understanding Realistic Utilization

**Dashboard now shows:**
- **Available:** Time available for work
- **Planned:** Total capacity consumed (not just duration)
- **Utilization:** Realistic percentage (e.g., 91% instead of 337%)

---

## Real-World Example

### Scenario: Lindsey Comerford, Product Designer

**Quarter:** Q2 FY2026 (12 weeks)

**Time Off:**
- OKR Time: 2 weeks
- PTO: 1.8 weeks
- Holidays: 0.2 weeks
- **Available Capacity:** 9.2 weeks

**Projects (Before - Inaccurate):**
| Project | Duration | Calculation |
|---------|----------|-------------|
| 11 projects across domains | 31.0 weeks total | 31.0 weeks planned |
| **Utilization** | | **337% ❌** |

**Projects (After - Accurate):**
| Project | Duration | Allocation | Capacity |
|---------|----------|------------|----------|
| Discovery Adult Beverage | 2 weeks | 3% | 0.06 weeks |
| Discovery CPI Category | 3 weeks | 15% | 0.45 weeks |
| SACP Training | 5 weeks | 10% | 0.5 weeks |
| Discovery Fresh | 4 weeks | 40% | 1.6 weeks |
| Discovery Gen Merch | 2 weeks | 15% | 0.3 weeks |
| SACP Planning | 4 weeks | 75% | 3.0 weeks |
| *5 more projects* | Various | Various | ~2.5 weeks |
| **Total** | | | **~8.4 weeks** |
| **Utilization** | | | **91% ✅** |

**Result:** Realistic capacity planning with actionable metrics.

---

## Technical Implementation

### Data Structure Changes

**Project Object (Before):**
```javascript
{
  id: 'uuid',
  title: 'Project Alpha',
  startDate: '2024-01-01',
  weeksMode: 'fixed',
  weeks: 4,
  customEndDate: null,
  supportNeeds: []
}
```

**Project Object (After):**
```javascript
{
  id: 'uuid',
  title: 'Project Alpha',
  startDate: '2024-01-01',
  weeksMode: 'fixed',
  weeks: 4,
  customEndDate: null,
  supportNeeds: [],
  allocationPercent: 75,    // NEW: defaults to 100
  storyPoints: 8            // NEW: optional, defaults to null
}
```

### New Calculation Functions

**`calculateProjectCapacity(project)`**
```javascript
// Calculates capacity consumed by a project
// Returns: duration × (allocation % / 100)
const capacity = calculateProjectCapacity({
  weeks: 4,
  allocationPercent: 75
});
// Result: 3.0 weeks
```

**`calculateDomainCapacity(domain)`**
```javascript
// Sums capacity across all projects in a domain
const capacity = calculateDomainCapacity({
  projects: [
    { weeks: 4, allocationPercent: 75 },
    { weeks: 2, allocationPercent: 50 }
  ]
});
// Result: 4.0 weeks (3.0 + 1.0)
```

**`detectCapacityConflicts(projects)`**
```javascript
// Detects overlapping projects exceeding 100% allocation
const conflicts = detectCapacityConflicts([
  { title: 'P1', startDate: '2024-01-01', weeks: 2, allocationPercent: 75 },
  { title: 'P2', startDate: '2024-01-08', weeks: 2, allocationPercent: 45 }
]);
// Result: [{ startDate, endDate, totalAllocation: 120, projects: [...] }]
```

### Modified Files

| File | Changes |
|------|---------|
| `src/utils/storage.js` | Added `migrateProjectData()`, updated `loadICs()` |
| `src/utils/calculations.js` | Added 3 new functions, updated `generateSummary()` |
| `src/context/CapacityContext.jsx` | Updated `calculateResults()` to use capacity |
| `src/components/DomainForm.jsx` | Added allocation & story points inputs |
| `src/components/GanttChart.jsx` | Added conflict detection & visual indicators |
| `src/App.css` | Added `.gantt-bar--conflict` styles |
| `src/utils/calculations.test.js` | Added 30+ new tests |
| `src/components/SupportNeedsSelector.jsx` | Updated placeholder text |

---

## Data Migration

### Automatic Migration

All existing data is **automatically migrated** when loaded:

```javascript
// Migration function (runs on data load)
export const migrateProjectData = (project) => {
  return {
    ...project,
    allocationPercent: project.allocationPercent ?? 100,  // Default to 100%
    storyPoints: project.storyPoints ?? null              // Optional field
  };
};
```

### Backward Compatibility

✅ **No user action required**
✅ **Existing projects default to 100% allocation**
✅ **All calculations work with legacy data**
✅ **LocalStorage auto-saves on next change**

### Migration Behavior

1. User opens app with old data
2. `loadICs()` runs migration automatically
3. All projects get `allocationPercent: 100` and `storyPoints: null`
4. Calculations work immediately
5. Next save persists migrated data

---

## Testing

### Test Coverage

**Total Tests:** 93 passing ✅

**New Tests (30+):**
- `calculateProjectCapacity()`: 11 tests
  - 100% allocation, partial allocation, defaults, edge cases
- `calculateDomainCapacity()`: 7 tests
  - Multiple projects, empty domains, null handling
- `detectCapacityConflicts()`: 12 tests
  - Overlapping projects, non-overlapping, edge cases

### Test Scenarios Covered

✅ Projects with various allocation percentages (0%, 25%, 50%, 75%, 100%, >100%)
✅ Projects without allocation (defaults to 100%)
✅ Custom date ranges with allocation
✅ Conflict detection for overlapping projects
✅ No conflicts when projects don't overlap
✅ No conflicts when overlaps total <100%
✅ Multiple simultaneous projects
✅ Edge cases: null/undefined inputs, invalid data

### Running Tests

```bash
# Run all tests
npm test -- --run

# Run only calculation tests
npm test -- --run src/utils/calculations.test.js
```

---

## Benefits

### For Individual Contributors

✅ **Realistic capacity planning** - see actual available time for new work
✅ **Early conflict detection** - know when you're over-allocated before it's a problem
✅ **Better work-life balance** - visibility into actual workload
✅ **Context-switching awareness** - understand when you're juggling too many projects

### For Managers

✅ **Accurate resource allocation** - make informed decisions about project assignments
✅ **Data-driven planning** - realistic metrics instead of inflated percentages
✅ **Bottleneck identification** - see which team members are truly at capacity
✅ **Prioritization support** - use allocation % to guide priority discussions

### For Teams

✅ **Improved collaboration** - shared understanding of capacity constraints
✅ **Better forecasting** - more accurate delivery estimates
✅ **Reduced burnout** - proactive over-allocation detection
✅ **Transparent workload** - everyone can see team capacity status

---

## Future Enhancements

🔮 **Potential Future Features:**
- Jira API integration to sync story points, epics, stories, spikes
- Weekly allocation view (calendar showing % allocated per week)
- Team-level conflict detection across multiple ICs
- Allocation templates (e.g., "50% for 4 weeks" presets)
- Historical allocation tracking and reporting
- Capacity forecasting based on past patterns
- Mobile-optimized conflict alerts

---

## Troubleshooting

### Q: I see conflicts but don't think my projects overlap

**A:** Check the project start dates and durations carefully. Even a single day of overlap will be detected if the combined allocation exceeds 100%.

### Q: My utilization percentage is still very high

**A:** Make sure you've updated the allocation percentage for each project. New projects default to 100%. If you're working on multiple projects simultaneously, adjust their allocation percentages to reflect actual time distribution.

### Q: Can I use allocation percentages over 100%?

**A:** The system caps allocation at 100% per project. If you enter 150%, it will calculate as 100%. This prevents accidental over-allocation from a single project.

### Q: What happens to my old data?

**A:** All existing projects are automatically migrated to have 100% allocation. This preserves the original behavior until you manually adjust allocation percentages.

### Q: Story points don't seem to affect calculations

**A:** Correct! Story points are a reference field only. They appear in summaries and project forms but don't impact capacity calculations. This is by design for teams using Scrum methodology.

---

## References

- **Implementation Plan:** See commit message for detailed technical plan
- **CLAUDE.md:** Project documentation and methodology
- **IC Capacity Methodology.md:** Original capacity calculation methodology
- **Tests:** `src/utils/calculations.test.js` for comprehensive examples

---

## Support

For questions or issues:
1. Check this documentation
2. Review test files for usage examples
3. Contact the Product Design team
4. Create a GitHub issue on the repository

---

**Last Updated:** July 14, 2026
**Version:** 1.0.0
**Authors:** Tom Studer, Claude Sonnet 4.5
