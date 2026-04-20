# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IC Capacity Planning web app built with React to help Individual Contributors and managers estimate quarterly capacity using a standardized methodology. The app calculates available capacity vs. planned work across multiple domains and generates formatted summaries.

## Development Commands

```bash
# Start development server (port 3000)
npm start

# Run all tests (watch mode by default)
npm test

# Run tests once (CI mode)
npm test -- --watchAll=false

# Run specific test file
npm test -- calculations.test.js

# Production build
npm run build
```

## Architecture

### State Management: React Context Pattern

All application state lives in `CapacityContext` (`src/context/CapacityContext.jsx`):
- **ICs array**: All capacity plans
- **activeICId**: Currently selected IC
- **CRUD operations**: createIC, updateIC, deleteIC, duplicateIC
- **calculateResults**: Core calculation orchestrator

Components access state via `useCapacity()` hook. No prop drilling.

### Data Flow

```
User Input (Form Components)
  ↓
updateIC() → CapacityContext state
  ↓
Auto-save to localStorage (300ms debounce)
  ↓
calculateResults() → Real-time calculations
  ↓
Dashboard & Summary display
```

### Pure Calculation Layer

`src/utils/calculations.js` contains pure functions with NO side effects:
- `calculateTimeOff`: OKR + PTO/Dev/Holiday → weeks
- `calculateDomainEffort`: Small/Medium/Large projects → weeks
- `calculateTotalPlanned`: Sum domain efforts
- `calculateUtilization`: (Planned / Available) × 100
- `calculateStatus`: Returns 'under' | 'fully' | 'over'
- `generateSummary`: IC + calculated → formatted markdown output

All calculations work in **WEEKS** as the base unit.

### Storage

`src/utils/storage.js` handles localStorage persistence:
- `loadICs()` / `saveICs()`: IC data array
- `loadActiveICId()` / `saveActiveICId()`: Selected IC
- Auto-save triggers on every state change (debounced)

## Critical Implementation Details

### ⚠️ Project Sizes are WEEKS not DAYS

**CRITICAL:** The methodology defines:
- Small = **2 WEEKS** (not 2 days)
- Medium = **4 WEEKS** (not 4 days)
- Large = **8 WEEKS** (not 8 days)

`calculateDomainEffort` returns WEEKS directly. Do NOT divide by 5 or convert to days.

**Historical bug:** Commit `508bcd6` fixed an error where these were incorrectly treated as days and divided by 5. The calculation now correctly returns weeks.

### Form Input Type Conversion

**CRITICAL:** HTML form inputs return strings, but calculations require numbers.

All form change handlers MUST convert to numbers:
```javascript
const handleChange = (e) => {
  const value = e.target.value === '' ? 0 : Number(e.target.value);
  updateIC(activeIC.id, { field: value });
};
```

Affected components:
- `QuarterInfoForm`: `weeksInQuarter`
- `TimeOffForm`: `okrTime.value`, `ptoDays`, `devDays`, `holidayDays`
- `DomainForm`: `smallProjects`, `mediumProjects`, `largeProjects`

**Historical bug:** Commit `6ead722` fixed calculations showing 0.0 because string values failed validation.

### Data Structure Mapping

The IC data structure uses different property names than calculation functions expect:

**IC Domain Object:**
```javascript
{
  smallProjects: 3,
  mediumProjects: 1,
  largeProjects: 2
}
```

**calculateDomainEffort expects:**
```javascript
{
  small: 3,
  medium: 1,
  large: 2
}
```

CapacityContext transforms between these when calling calculations (see `calculateResults()`).

Similarly, `timeOff` structure must be transformed:
```javascript
// IC structure
timeOff: {
  okrTime: { value: 2, unit: 'weeks' },
  ptoDays: 5,
  devDays: 1,
  holidayDays: 0
}

// Transformed for calculateTimeOff()
{
  okrWeeks: 2,  // if unit === 'weeks'
  pto: 5,
  dev: 1,
  holiday: 0
}
```

## Testing

48 tests in `src/utils/calculations.test.js` covering:
- All calculation functions
- Edge cases (negative values, null/undefined, non-numeric)
- Type coercion and validation
- Float to integer conversion

**Jest configuration notes:**
- `transformIgnorePatterns` excludes `uuid` module (ES modules require transformation)
- Lodash pinned to `4.17.21` (compatibility with webpack)

Always run tests before committing:
```bash
npm test -- --watchAll=false
```

## Component Structure

### Form Components (controlled inputs)
- `QuarterInfoForm`: Quarter name, weeks in quarter
- `ICInfoForm`: IC name, role
- `TimeOffForm`: OKR time, PTO, Dev, Holiday (displays calculated total)
- `DomainForm`: Single domain card with projects (displays calculated total)
- `DomainList`: Manages domain array, add/delete

### Display Components
- `ICSelector`: Dropdown + create/duplicate/delete IC controls
- `CapacityDashboard`: Real-time utilization, color-coded status, breakdown
- `FormattedOutput`: Modal with methodology-compliant markdown summary

### Main App
`App.jsx`: Two-column layout (forms left, dashboard right) with theme provider.

## Capacity Calculation Methodology

Based on `/Users/ts73344/Desktop/pd_capacity/IC Capacity Methodology.md`:

1. **Total Time Off (weeks):**
   - If OKR in weeks: `okrWeeks + ((pto + dev + holiday) / 5)`
   - If OKR in days: `(okrDays + pto + dev + holiday) / 5`

2. **Total Available:** `Weeks in quarter - Total time off`

3. **Domain Effort:** `(Small × 2) + (Medium × 4) + (Large × 8)` weeks

4. **Total Planned:** Sum of all domain efforts

5. **Utilization:** `(Total planned / Total available) × 100`

6. **Status:**
   - Under capacity: < 90%
   - Fully allocated: 90-100%
   - Over capacity: > 100%

## Common Gotchas

1. **Don't convert weeks to days in calculations** - work in weeks throughout
2. **Always convert form inputs to numbers** - strings will fail validation
3. **Map property names when calling calculations** - IC structure ≠ calculation params
4. **Use `calculateResults()` in CapacityContext** - don't call calculation functions directly from components
5. **generateSummary signature changed** - now takes `(ic, calculated)` not individual fields
6. **Avoid reading SVG files multiple times** - SVG files with long path definitions consume many tokens when read. Use Glob or Grep to locate them, then read once. Assets in `public/` directory don't need to be read unless modifying them.
