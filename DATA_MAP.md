# Capacity Planning App - Data Map

## Overview
The application manages **team capacity planning data** organized around Individual Contributors (ICs) and their quarterly capacity allocation across multiple domains.

---

## Root Data Objects

### 1. **Team** (Application-level)
```json
{
  "teamName": "string",          // Team/organization name
  "ics": [/* IC array */],       // Array of team members
  "activeICId": "uuid"           // Currently selected team member ID
}
```
**Stored in:** `localStorage`
**Keys:**
- `capacity-planning-team-name` → teamName
- `capacity-planning-ics` → ics array
- `capacity-planning-active-id` → activeICId
- `capacity-planning-version` → schema version (currently 1)

---

## 2. **IC (Individual Contributor)** - Core Data Model

```json
{
  "id": "uuid",                           // Unique identifier (UUIDv4)
  "icName": "string",                     // Person's name
  "icRole": "string",                     // Job role (see roles below)
  "quarter": "string",                    // Quarter identifier (e.g., "Q1", "Q2")
  "weeksInQuarter": "number",             // Total weeks available in quarter
  "lastModified": "ISO 8601 timestamp",   // When record was last updated
  "timeOff": {/* TimeOff object */},      // Time away from work
  "domains": [/* Domain array */]         // Areas of responsibility
}
```

**Role Options:**
- Associate Product Designer
- Product Designer
- Senior Product Designer
- User Researcher
- Senior User Researcher
- Service Designer
- Senior Service Designer
- Journey Architect

---

## 3. **TimeOff** (Nested in IC)

```json
{
  "okrTime": {
    "value": "number",        // Amount of OKR-related time
    "unit": "string"          // 'days' or 'weeks'
  },
  "ptoDays": "number",        // Paid time off (in days)
  "devDays": "number",        // Professional development days
  "holidayDays": "number"     // Company holidays/closures (in days)
}
```

**Calculation:**
- If `okrTime.unit === 'weeks'`: `okrTime + ((pto + dev + holiday) / 5)`
- If `okrTime.unit === 'days'`: `(okrTime + pto + dev + holiday) / 5`
- Result = **Total weeks of time off**

---

## 4. **Domain** (Nested in IC.domains array)

```json
{
  "id": "uuid",                    // Unique identifier
  "name": "string",                // Domain/product area name
  "smallProjects": "number",       // Count of small projects (2 weeks each)
  "mediumProjects": "number",      // Count of medium projects (4 weeks each)
  "largeProjects": "number",       // Count of large projects (8 weeks each)
  "extraLargeProjects": "number"   // Count of extra large projects (9 weeks each)
}
```

**Effort Calculation:**
- Small = count × 2 weeks
- Medium = count × 4 weeks
- Large = count × 8 weeks
- Extra Large = count × 9 weeks
- **Domain Total** = sum of all project weeks

---

## Calculated Results (Runtime)

When `calculateResults(ic)` is called, returns:

```json
{
  "totalWeeksInQuarter": "number",
  "totalTimeOffWeeks": "number",
  "totalWeeksAvailable": "number",           // Quarter - TimeOff
  "domainEfforts": [
    {
      "domainId": "uuid",
      "domainName": "string",
      "totalWeeks": "number",
      "breakdown": {
        "smallWeeks": "number",
        "mediumWeeks": "number",
        "largeWeeks": "number",
        "extraLargeWeeks": "number"
      }
    }
  ],
  "totalPlannedWork": "number",              // Sum of all domain weeks
  "capacityUtilization": "number",           // (Planned / Available) × 100
  "overUnderCapacity": "number",             // Planned - Available
  "status": "string"                         // 'under' | 'fully' | 'over'
}
```

**Status Logic:**
- `under` if utilization < 90%
- `fully` if utilization >= 90% and <= 100%
- `over` if utilization > 100%

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  localStorage                                           │
│  - capacity-planning-ics (IC array)                     │
│  - capacity-planning-team-name                          │
│  - capacity-planning-active-id                          │
│  - capacity-planning-version                            │
└────────────┬────────────────────────────────────────────┘
             │ Load on app mount
             ▼
┌─────────────────────────────────────────────────────────┐
│  CapacityContext (React)                                │
│  ├─ ics[] (IC array)                                    │
│  ├─ activeICId (UUID)                                   │
│  ├─ teamName (string)                                   │
│  └─ activeIC (IC object reference)                      │
└────────────┬────────────────────────────────────────────┘
             │
             ├──► calculateResults(ic) ──► Calculated Results
             │
             ├──► updateIC(id, updates) ──► Save to localStorage (debounced 300ms)
             │
             ├──► createIC() ──► New IC with empty template
             │
             └──► deleteIC(id) / duplicateIC(id) / reorderICs()
```

---

## State Management Methods

### Create Operations
- **createIC()** → Creates new IC with template, generates UUID, returns ID
- **importIC(icData)** → Imports IC from external source, assigns new UUID

### Update Operations
- **updateIC(id, updates)** → Merges updates, adds `lastModified` timestamp
- **updateTeamName(name)** → Updates team-level name

### Delete Operations
- **deleteIC(id)** → Removes IC, switches active IC if needed
- **clearIC(id)** → Resets IC to empty template (preserves ID)

### Utility Operations
- **setActiveIC(id)** → Sets currently selected IC
- **duplicateIC(id)** → Creates copy with "(Copy)" suffix
- **reorderICs(fromId, toId)** → Changes IC order in array

---

## Data Validation Rules

| Field | Type | Required | Constraints | Example |
|-------|------|----------|-------------|---------|
| `icName` | string | Yes | Non-empty | "Jane Smith" |
| `icRole` | string | No | Must be from role list | "Product Designer" |
| `quarter` | string | Yes | Format varies | "Q1 2024" |
| `weeksInQuarter` | number | Yes | > 0 | 13 |
| `ptoDays` | number | No | >= 0 | 5 |
| `devDays` | number | No | >= 0 | 2 |
| `holidayDays` | number | No | >= 0 | 8 |
| `smallProjects` | number | No | >= 0 | 3 |
| `mediumProjects` | number | No | >= 0 | 1 |
| `largeProjects` | number | No | >= 0 | 2 |
| `extraLargeProjects` | number | No | >= 0 | 0 |

---

## Export Capabilities

The app supports exporting data as JSON:

1. **Export Single IC** → `capacity-{icName}-{date}.json`
2. **Export All ICs** → `capacity-all-ics-{date}.json`

Both include full IC object structure (domains, timeOff, etc.)

---

## Integration Points

### Data Input
- **Manual form input** via UI
- **JSON import** from external files
- **Duplicate IC** from existing record

### Data Output
- **JSON export** for backup/migration
- **Markdown summary** (copy to clipboard)
- **Real-time calculations** for display

### Potential Integrations
- **HR Systems** → Sync IC names, roles, team structure
- **Project Management Tools** → Sync domain/project data
- **Time Off/Calendar Systems** → Auto-populate PTO, holidays
- **Analytics/BI Tools** → Export capacity utilization metrics
- **Workforce Planning Tools** → Two-way sync of capacity data

---

## Version Info
- **Current Schema Version:** 1
- **Storage Technology:** Browser localStorage (no backend)
- **Data Format:** JSON

---

## Notes for Integration Teams

1. **ID Strategy:** UUIDs are generated client-side; external systems should preserve these or maintain mapping
2. **Timestamps:** `lastModified` is ISO 8601 format; useful for sync detection
3. **Calculation Basis:** All work is measured in **WEEKS** (not days)
4. **Persistence:** Data is debounced (300ms) to localStorage; no backend sync currently
5. **Validation:** Teams should validate data before import; see validation rules above
