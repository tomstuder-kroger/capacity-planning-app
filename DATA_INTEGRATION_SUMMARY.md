# Capacity Planning App - Data Integration Summary
**For Executive & Cross-Functional Team Discussions**

---

## What We Track
The app helps managers understand **how much work their team can realistically do** in a quarter by tracking:

| What | Why It Matters |
|------|---|
| **Team Members** | Who's on the team, their role/title |
| **Available Time** | Quarters × weeks available - time off (PTO, holidays, development) |
| **Planned Work** | Projects by size (2-week, 4-week, 8-week, 9-week chunks) |
| **Utilization** | Are we under-capacity, fully booked, or over-committed? |

---

## Current State
- ✅ **Data stored locally** in browser (fully functional for teams)
- ✅ **Manual entry & JSON import/export** currently supported
- ❌ **No backend integration** yet

---

## Integration Opportunities

### 🔗 **Team & Roster Data** (Highest Priority)
**Sync from:** HR systems, Workday, ADP
**Benefits:**
- Automatically create/update team members when hired/promoted
- Real-time role changes (APD → PD → SPD)
- Eliminate manual entry

### 📅 **Time Off Data** (High Priority)
**Sync from:** Calendar systems, time tracking apps
**Benefits:**
- Auto-populate PTO, holidays, company closures
- Reduce manual entry errors
- Keep capacity forecasts accurate

### 📊 **Project & Work Data** (Medium Priority)
**Sync from:** Jira, Linear, Asana, Monday.com
**Benefits:**
- Link capacity planning to actual project assignments
- Real-time project size updates
- Track actuals vs. planned capacity

### 📈 **Analytics & Reporting** (Medium Priority)
**Sync to:** BI tools (Tableau, Looker, Power BI)
**Benefits:**
- Org-level capacity visibility
- Utilization trends over quarters
- Resource planning insights

---

## What's Ready for Integration

### Export Capabilities
- Individual team member capacity data (JSON)
- Full team snapshot (JSON)
- Ready for consumption by BI/analytics tools

### Data Fields Available
```
Team Member
├─ Name
├─ Role (8 role options: APD, PD, SPD, UX Researchers, Service Designers, Architects)
├─ Quarter & Weeks Available
├─ Time Off (PTO, holidays, development days, OKR time)
└─ Planned Work (domains with projects by size)

Calculations Available
├─ Total available capacity (weeks)
├─ Total planned work (weeks)
├─ Utilization % (planned/available)
└─ Over/under capacity (weeks)
```

---

## Next Steps for Integration Talks

**Ask these teams to the table:**
1. **HR/People Systems** → Roster sync, role management
2. **Finance/Planning** → Capacity forecasting requirements
3. **Engineering/PM Tools** → Project tracking sync
4. **BI/Analytics** → Reporting and trend analysis

**Key Questions to Answer:**
- Do we need real-time sync or batch weekly/monthly?
- Which system of record for team structure? (Workday? HRIS?)
- Should capacity data push to a central reporting tool?
- Are there compliance/data residency needs?

---

## Value Proposition
| Current | With Integrations |
|---------|---|
| Manual entry, errors, stale data | Automated, real-time, accurate |
| Siloed capacity insights | Org-wide visibility & planning |
| After-the-fact tracking | Proactive capacity forecasting |
| Spreadsheet-driven | System of record integration |

---

**Need the detailed technical specs?** See `DATA_MAP.md` for full field definitions, calculation logic, and API requirements.
