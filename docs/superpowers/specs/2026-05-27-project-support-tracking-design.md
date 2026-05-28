# Project Support Tracking - Design Specification

**Date:** 2026-05-27
**Feature:** Track User Research and Service Designer support needs for projects
**Branch:** shared-services-support

## Overview

Enable individual contributors to mark which projects require support from User Research or Service Designer resources. Display these support needs in multiple views: on project cards, in the individual dashboard, in formatted output summaries, and in a team-wide support coordination view.

## Requirements

- Users need to identify when projects require User Research support
- Users need to identify when projects require Service Designer support
- Support needs must be visible on the project card itself
- Support needs must be aggregated in summary/report views
- A team-wide view must show all support requests across all ICs to aid resource allocation

## Data Model

### Project Structure Update

Add a `supportNeeds` field to each project object:

```javascript
project = {
  id: uuidv4(),
  title: '',
  startDate: null,
  weeksMode: 'fixed',
  weeks: 1,
  customEndDate: null,
  supportNeeds: []  // NEW: array of strings
}
```

**Valid Values:**
- Empty array `[]` - no support needed
- `['User Research']` - only user research needed
- `['Service Designer']` - only service designer needed
- `['User Research', 'Service Designer']` - both needed

**Storage:**
- Persisted to localStorage as part of IC data structure
- No schema migration required - existing projects without the field default to `[]`
- No impact on capacity calculations or methodology

## User Interface

### 1. Project Card - Multi-Select Dropdown

**Location:** `DomainForm.jsx`, within `ProjectRow` component

**Layout:**
```
Project Item Layout:
┌─────────────────────────────────────┐
│ Project                    [Trash]  │
├─────────────────────────────────────┤
│ Title: [text input]                 │
│                                     │
│ Start Date: [date picker]           │
│ Duration: [dropdown]                │
│ Support Needed: [multi-select ▼]    │  ← NEW
│                                     │
│ [calculated weeks display if custom]│
└─────────────────────────────────────┘
```

**Multi-Select Dropdown:**
- Label: "Support Needed" (optional field)
- Placeholder when empty: "Select support types..."
- Options: "User Research", "Service Designer"
- Allow selecting 0, 1, or 2 options
- Display selected values as chips/tags or comma-separated text
- Use KDS/MX multi-select component if available, otherwise custom implementation

### 2. Capacity Dashboard - Support Needs Section

**Location:** Right panel in `CapacityDashboard.jsx`, below capacity metrics

**Display Format:**
```
┌─────────────────────────────────────┐
│ Support Needed                      │
│ ─────────────────────────────       │
│ User Research:                      │
│   • Family Tree Discovery           │
│   • Task List UI                    │
│                                     │
│ Service Designer:                   │
│   • CFIC                            │
└─────────────────────────────────────┘
```

**Rules:**
- Shows only active IC's support needs
- Format: `Project Title` only
- Groups projects by support type
- Sorts projects alphabetically within each group
- Hides section entirely if no support needs exist

### 3. Formatted Output - Markdown Summary

**Location:** Generated markdown in `FormattedOutput.jsx`

**Display Format:**
```markdown
## Support Needed

**User Research:**
- Family Tree Discovery (Domain: Family Tree)
- Task List UI (Domain: Item Watchtower)

**Service Designer:**
- CFIC (Domain: CFIC)
```

**Rules:**
- Shows only active IC's support needs
- Format: `Project Title (Domain: Domain Name)`
- Omit entire section if no support needs exist
- Projects sorted alphabetically within each support type

### 4. Team Support View - Full Page Report

**Location:** New view accessible from header navigation

**Display Format:**
```
┌──────────────────────────────────────────────────────────┐
│ Team Support Needs                                       │
├──────────────────────────────────────────────────────────┤
│ User Research                                            │
│ ─────────────────────────────────────────────            │
│ • Family Tree Discovery - Colin Johnston (Family Tree)   │
│ • Task List UI - David Oberholtzer (Item Watchtower)     │
│ • Discovery PID Deprecation - Rob Sloan (Item: PID)      │
│                                                          │
│ Service Designer                                         │
│ ─────────────────────────────────────────────────────    │
│ • CFIC - Colin Johnston (CFIC)                           │
│ • Discovery Navigator - SFP Backfill (SFP Apps)          │
└──────────────────────────────────────────────────────────┘
```

**Rules:**
- Aggregates all ICs' support needs across the entire team
- Format: `Project Title - IC Name (Domain Name)`
- Groups by support type, sorted alphabetically within groups
- Shows empty state if no support needs exist team-wide
- Shows only populated support type sections

## Component Architecture

### New Components

**`SupportNeedsSelector.jsx`**
- Reusable multi-select dropdown component
- Props: `value` (array), `onChange` (callback)
- Renders selected values as chips or comma-separated text
- Used within `ProjectRow` component

**`SupportNeedsDashboard.jsx`**
- Displays active IC's support needs in dashboard
- Groups projects by support type
- Handles empty states

**`TeamSupportView.jsx`**
- Full-page view for team-wide support coordination
- Aggregates all ICs' projects with support needs
- Includes "Back to Capacity Planning" navigation
- Shows empty state when no team support needs exist

### Modified Components

**`DomainForm.jsx` / `ProjectRow`**
- Add `SupportNeedsSelector` field after Duration
- Initialize new projects with `supportNeeds: []`
- Handle updates to `supportNeeds` array

**`CapacityDashboard.jsx`**
- Include `SupportNeedsDashboard` component in layout
- Position below existing capacity metrics

**`FormattedOutput.jsx`** (or summary generation logic)
- Add "Support Needed" section to markdown output
- Use utility function to generate content

**`App.jsx`**
- Add view state: `'planning'` | `'teamSupport'`
- Add header navigation link: "Team Support"
- Conditionally render main layout or `TeamSupportView`

### Utility Functions

**`src/utils/supportNeeds.js`** (new file)

```javascript
/**
 * Groups active IC's projects by support type
 * @param {Object} ic - Individual contributor object
 * @returns {Object} - { userResearch: [...projects], serviceDesigner: [...projects] }
 */
getSupportNeedsByType(ic)

/**
 * Aggregates all ICs' support needs with IC and domain info
 * @param {Array} ics - Array of all IC objects
 * @returns {Object} - { userResearch: [...items], serviceDesigner: [...items] }
 *   where each item is { projectTitle, icName, domainName }
 */
getTeamSupportNeeds(ics)

/**
 * Generates markdown section for support needs
 * @param {Object} ic - Individual contributor object
 * @returns {String} - Markdown formatted support summary
 */
generateSupportSummary(ic)
```

## Navigation & Routing

**Header Navigation Approach:**

Add link in app header:
```
┌────────────────────────────────────────────┐
│ PD Capacity Planner  |  Team Support      │
└────────────────────────────────────────────┘
```

**Implementation:**
- Add state to `App.jsx`: `view` = `'planning'` | `'teamSupport'`
- Clicking "Team Support" replaces two-column layout with `TeamSupportView`
- Team Support view includes "Back to Capacity Planning" button
- Returns to planning view with active IC preserved

## Edge Cases & Empty States

### Data Migration
- Existing projects without `supportNeeds` field: treat as empty array `[]`
- Handle in components with `project.supportNeeds || []`
- No explicit migration needed

### Empty States

**Project Card - No Support Selected:**
- Dropdown shows placeholder: "Select support types..."
- No additional visual indicator

**Dashboard Support Section - No Support Needs:**
- Hide "Support Needed" section entirely when active IC has no requests

**Formatted Output - No Support Needs:**
- Omit "## Support Needed" section entirely from markdown

**Team Support View - No Team Support Needs:**
- Show empty state: "No support requests across the team"

**Team Support View - Partial Support Types:**
- Show only populated sections (hide empty support type headings)

### Display Handling

**Untitled Projects:**
- Display as "Untitled Project" in all summary views

**Projects Without Domains:**
- Display as "(No Domain)" in formatted output and team view

**Ordering:**
- Projects sorted alphabetically by title within each support type
- Support type sections always appear in fixed order: User Research, then Service Designer

### Validation
- No validation required - selecting support is optional
- Allow removing all selections (returning to empty array)

## Styling & Visual Design

### Multi-Select Dropdown
- Use KDS `MxSelect` component if multi-select variant exists
- Fallback: Custom component matching KDS visual patterns
- Selected values shown as chips (KDS chip style) or comma-separated text
- Follow existing form field styling in `ProjectRow`
- Match label font weight (700) and sizing with other project fields

### Dashboard Support Section
- Use existing card styling (`kds-Card kds-Card--m`)
- Match heading style with other dashboard sections (`kds-Heading kds-Heading--s`)
- Bullet list styling consistent with domain breakdown
- Subtle divider between support types

### Team Support View
- Full-page layout with KDS card container
- Page title using existing heading styles
- List items with consistent spacing and typography
- "Back to Capacity Planning" button: `KdsButton kind="secondary"`

### Accessibility
- Multi-select dropdown has proper `aria-label="Support needed"`
- Keyboard navigation for selecting/deselecting options
- Screen reader announces selected support types
- Visible focus indicators on all interactive elements

## Implementation Notes

### Component Hierarchy
```
App
├─ Planning View (current two-column layout)
│  ├─ Left Column
│  │  └─ DomainList
│  │     └─ DomainForm
│  │        └─ ProjectRow
│  │           └─ SupportNeedsSelector (NEW)
│  └─ Right Column
│     └─ CapacityDashboard
│        └─ SupportNeedsDashboard (NEW)
│
└─ TeamSupportView (NEW)
```

### Data Flow
1. User selects support types in `SupportNeedsSelector`
2. `ProjectRow` calls `handleProjectUpdate` with updated `supportNeeds` array
3. `DomainForm` updates domain in context via `updateIC`
4. Context auto-saves to localStorage (300ms debounce)
5. All views reading from context automatically re-render

### Testing Considerations
- Test with empty `supportNeeds` arrays (backward compatibility)
- Test with one support type selected
- Test with both support types selected
- Test team view with mix of ICs (some with support needs, some without)
- Test empty states at all levels
- Test sorting (alphabetical by project title)
- Verify localStorage persistence across page reloads

## Out of Scope (MVP)

The following are explicitly excluded from this implementation:

- Priority levels for support requests (high/medium/low)
- Notes or comments on support needs
- Status tracking (requested/assigned/fulfilled)
- Additional support types beyond User Research and Service Designer
- Configurable support types in settings
- Filtering/search in team support view
- Export/print functionality for team support report
- Notifications or alerts for support requests
- Timeline view of when support is needed
- Integration with external resource management tools

These may be considered for future iterations based on user feedback.
