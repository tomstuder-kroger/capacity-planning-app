# IC Capacity Planning App: Use Cases & Data Overview

**Document Purpose:** Strategic discovery for build vs buy consideration
**Audience:** Strategic and Portfolio Operations
**Date:** 2026-08-13
**Version:** 1.0

---

## Executive Summary

The IC Capacity Planning App is a web-based tool that helps Individual Contributors (ICs) and their managers estimate quarterly capacity using a standardized methodology. It addresses the gap between requested work and available time by providing structured capacity calculations across multiple work domains (e.g., Dev Support, Product Features, Operational Excellence).

**Key Value:** Replaces ad-hoc spreadsheet approaches with a consistent, repeatable methodology that generates leadership-ready capacity summaries in a standardized format.

---

## Problem Statement & Current State

### Pain Points Addressed

1. **Inconsistent capacity estimation** - Teams use different methods (hours, days, story points) making cross-team comparisons difficult
2. **Hidden time drains** - OKR time, meetings, and operational overhead often excluded from capacity calculations
3. **Manual effort** - Spreadsheet-based approaches require manual formula management and are error-prone
4. **No single source of truth** - Capacity data scattered across individual spreadsheets, hard to aggregate or compare
5. **Time-consuming reporting** - Managers manually format capacity summaries for leadership reviews

### Current Solution Approach

Custom-built React web application with:
- Browser-based (no server/database required)
- localStorage for data persistence
- Standardized calculation methodology baked into the tool
- Real-time validation and utilization feedback
- One-click formatted summary generation

---

## User Personas & Roles

### Primary Users

**Individual Contributors (ICs)**
- Software engineers, designers, product managers, analysts
- **Need:** Estimate quarterly capacity to negotiate realistic commitments
- **Goal:** Demonstrate capacity constraints with data, not gut feel

**People Managers**
- Engineering managers, team leads
- **Need:** Understand team capacity to align with organizational priorities
- **Goal:** Make informed staffing and prioritization decisions

### Secondary Users

**Portfolio Managers / Leadership**
- Consume formatted capacity summaries for strategic planning
- **Need:** Understand organizational capacity across teams
- **Goal:** Identify capacity gaps, hiring needs, or priority conflicts

---

## Use Cases

### UC-1: Quarterly Capacity Planning (Primary)

**Actor:** IC or Manager
**Frequency:** Quarterly (4x/year)
**Workflow:**

1. Create new capacity plan for IC
2. Enter quarter information (name, weeks in quarter)
3. Document time off commitments:
   - OKR/goal time (strategic work)
   - PTO, development days, holidays
4. Break down planned work by domain:
   - Categorize projects as Small (2 weeks), Medium (4 weeks), or Large (8 weeks)
   - Tool calculates total effort per domain
5. Review real-time utilization dashboard:
   - See if under-capacity (<90%), fully allocated (90-100%), or over-capacity (>100%)
6. Adjust commitments or negotiate scope based on feedback
7. Generate formatted summary for leadership review

**Outcome:** Data-driven capacity plan with clear utilization metrics

---

### UC-2: Mid-Quarter Adjustment

**Actor:** IC or Manager
**Frequency:** Ad-hoc (as priorities shift)
**Workflow:**

1. Open existing capacity plan
2. Update domains with new/changed projects
3. Dashboard automatically recalculates utilization
4. Identify capacity conflicts (over-allocation)
5. Export updated summary to communicate changes

**Outcome:** Updated capacity plan reflecting current commitments

---

### UC-3: Team Capacity Aggregation

**Actor:** Manager
**Frequency:** Quarterly
**Workflow:**

1. Create separate capacity plans for each IC on team
2. Review individual utilization across team members
3. Use export/import features to consolidate data
4. Identify:
   - Team members at risk of burnout (>100% utilization)
   - Underutilized capacity
   - Domain-specific bottlenecks

**Outcome:** Team-level capacity view for strategic planning

---

### UC-4: Historical Comparison

**Actor:** IC or Manager
**Frequency:** Quarterly
**Workflow:**

1. Duplicate previous quarter's capacity plan
2. Compare planned vs actual effort (qualitative review)
3. Adjust estimation approach for improved accuracy
4. Use learnings to calibrate future estimates

**Outcome:** Improved estimation accuracy over time

---

### UC-5: Headcount Justification

**Actor:** Manager
**Frequency:** Annual planning cycles
**Workflow:**

1. Model team capacity with current headcount
2. Add hypothetical IC plans to model additional headcount
3. Compare capacity gaps vs organizational priorities
4. Generate summaries showing capacity shortfall
5. Use data to justify hiring requests

**Outcome:** Data-backed headcount request

---

## Data Structure & Attributes

### Data Entities

#### IC (Individual Contributor)
Core entity representing a person's capacity plan.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | UUID | Unique identifier | `"a3f2..."` |
| `name` | String | IC's name | `"Jane Smith"` |
| `role` | String | Job title/role | `"Senior Engineer"` |
| `quarterName` | String | Quarter identifier | `"Q3 2024"` |
| `weeksInQuarter` | Number | Available weeks in quarter | `13` |
| `timeOff` | Object | Time off breakdown | See below |
| `domains` | Array | Work domains | See below |

#### Time Off
Tracks non-project time commitments.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `okrTime.value` | Number | OKR/strategic time | `2` |
| `okrTime.unit` | String | weeks or days | `"weeks"` |
| `ptoDays` | Number | Planned time off | `5` |
| `devDays` | Number | Development/learning days | `2` |
| `holidayDays` | Number | Company holidays | `1` |

#### Domain
Represents a category of work (e.g., "Dev Support", "Product Features").

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | UUID | Unique identifier | `"d8a1..."` |
| `name` | String | Domain name | `"Dev Support"` |
| `smallProjects` | Number | Count of 2-week projects | `3` |
| `mediumProjects` | Number | Count of 4-week projects | `1` |
| `largeProjects` | Number | Count of 8-week projects | `0` |

### Calculated Metrics

These are computed in real-time, not stored:

| Metric | Formula | Description |
|--------|---------|-------------|
| Total Time Off | `okrWeeks + (days / 5)` | Total non-project time in weeks |
| Total Available | `weeksInQuarter - totalTimeOff` | Net capacity for project work |
| Domain Effort | `(small × 2) + (medium × 4) + (large × 8)` | Weeks required per domain |
| Total Planned | Sum of domain efforts | Total project commitments |
| Utilization % | `(totalPlanned / totalAvailable) × 100` | Capacity utilization |
| Status | Conditional based on utilization | Under/Fully/Over allocated |

### Data Storage

- **Format:** JSON in browser localStorage
- **Persistence:** Client-side only, no server/database
- **Export:** JSON download for backup/sharing
- **Import:** JSON upload to restore data

**Sample JSON Structure:**
```json
{
  "id": "a3f2-c4d5-e6f7",
  "name": "Jane Smith",
  "role": "Senior Engineer",
  "quarterName": "Q3 2024",
  "weeksInQuarter": 13,
  "timeOff": {
    "okrTime": { "value": 2, "unit": "weeks" },
    "ptoDays": 5,
    "devDays": 2,
    "holidayDays": 1
  },
  "domains": [
    {
      "id": "d8a1-b2c3-d4e5",
      "name": "Dev Support",
      "smallProjects": 3,
      "mediumProjects": 1,
      "largeProjects": 0
    }
  ]
}
```

---

## Unique/Custom Characteristics

### Why This May Be Custom-Built

1. **Methodology-Specific**
   - Calculations hardcoded to organizational capacity methodology
   - Project sizing (Small=2w, Medium=4w, Large=8w) may be company-specific
   - OKR time tracking reflects internal planning processes

2. **Lightweight & Zero Infrastructure**
   - No server, database, or deployment costs
   - Runs entirely in browser
   - No data privacy/security concerns (data never leaves user's machine)

3. **Tight Integration with Reporting Format**
   - Generates formatted markdown summaries in specific org format
   - Output designed for specific leadership review meetings

4. **Minimal Feature Set**
   - Focused tool, not bloated enterprise PM software
   - No licensing costs, authentication, user management overhead

### Potential Commercial Alternatives

Generic tools that *might* replace this (worth evaluating):

- **Resource management tools:** Smartsheet, Monday.com, Asana resource planning
- **Capacity planning modules:** Jira Advanced Roadmaps, ProductPlan
- **Spreadsheet templates:** Google Sheets/Excel with custom formulas

**Differentiation concerns:**
- Commercial tools may require adapting org methodology to tool constraints
- Licensing costs scale with user count
- May include unused features (bloat)
- Data stored in third-party systems (compliance review needed)

---

## Current Adoption & Usage

**Status:** [TO BE FILLED BY PRODUCT OWNER]

Suggested metrics to include:
- Number of active users
- Frequency of use (quarterly spikes expected)
- Teams/orgs using the tool
- Data exports generated per quarter
- User feedback/satisfaction

---

## Recommendations for Build vs Buy Evaluation

### Questions to Guide Decision

1. **Adoption:** How many users actively use this? Is demand growing?
2. **Methodology Stability:** Is the capacity calculation methodology likely to change? If yes, how easily can commercial tools adapt?
3. **Integration Needs:** Should capacity data integrate with other systems (HRIS, project management, BI tools)?
4. **Support Burden:** Who maintains this? What's the ongoing cost of custom development vs licensing?
5. **Data Portability:** Does leadership need aggregated capacity data across teams? Would a centralized tool help?

### Evaluation Criteria

| Criteria | Custom Build (Current) | Commercial Tool |
|----------|------------------------|-----------------|
| **Methodology fit** | Perfect (built for it) | May require customization |
| **Total cost** | Development + maintenance time | Licensing + implementation |
| **Time to value** | Immediate (already built) | Implementation timeline |
| **Scalability** | Manual export/aggregation | Centralized reporting |
| **Data governance** | No third-party risk | Vendor security review needed |
| **Feature evolution** | Dependent on dev capacity | Vendor roadmap + feature requests |

---

## Appendix: Technical Notes

- **Technology Stack:** React 18, Context API, localStorage
- **Testing:** 48 automated tests covering calculation logic
- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile:** Responsive design, usable on tablets
- **Accessibility:** Basic accessibility support (keyboard navigation, ARIA labels)
- **Deployment:** Static site hosting (GitHub Pages, S3, etc.)

---

**Document Owner:** [Your Name/Team]
**Contact:** [Email/Slack]
**Last Updated:** 2026-08-13
