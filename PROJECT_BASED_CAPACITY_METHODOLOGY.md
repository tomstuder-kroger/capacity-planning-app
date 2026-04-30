# IC Quarterly Capacity Planning Methodology (Project-Based)

## Purpose
This methodology is used to estimate an individual contributor's quarterly capacity and compare available time against planned work. It helps identify whether an IC is under capacity, fully allocated, or over capacity, and supports prioritization conversations with leaders and cross-functional partners.

---

## Default Assumptions
- **Planning unit:** 1 individual contributor (IC)
- **1 week = 5 workdays**
- **Project duration:** Directly entered in weeks or calculated from date ranges
- Decimal day values are allowed for time-off inputs

---

## Inputs Required

### Quarter Information
- **Quarter:**
- **Weeks in quarter:**

### IC Information
- **IC Name:**
- **IC Role:**

### Time Off
- **OKR time (days or weeks):**
- **PTO days:**
- **Dev / L&D / Development days:**
- **Holiday days:**

### Domain Support and Planned Work
- **How many domains does the IC support?:**

#### Domain 1
- **Domain name:**
- **Projects:**
  - Project 1 title: X weeks
  - Project 2 title: X weeks
  - (Additional projects as needed)

#### Domain 2
- **Domain name:**
- **Projects:**
  - Project 1 title: X weeks
  - Project 2 title: X weeks
  - (Additional projects as needed)

#### Domain 3
- **Domain name:**
- **Projects:**
  - Project 1 title: X weeks
  - Project 2 title: X weeks
  - (Additional projects as needed)

---

## Calculation Method

### 1) Total Weeks in Quarter
**Formula:**
`Total Weeks in Quarter = Weeks in Quarter`

### 2) Total Time Off
If OKR time is entered in weeks:
`Total Time Off (weeks) = OKR weeks + ((PTO days + Dev/L&D days + Holiday days) ÷ 5)`

If OKR time is entered in days:
`Total Time Off (weeks) = (OKR days + PTO days + Dev/L&D days + Holiday days) ÷ 5`

### 3) Total Weeks Available
**Formula:**
`Total Weeks Available = Total Weeks in Quarter - Total Time Off`

### 4) Planned Work by Domain
**Formula:**
`Domain Total (weeks) = Sum of all project weeks in domain`

### 5) Total Planned Work
**Formula:**
`Total Planned Work (weeks) = Sum of all Domain Totals`

### 6) Capacity Utilization
**Formula:**
`Capacity Utilization % = (Total Planned Work ÷ Total Weeks Available) × 100`

### 7) Over / Under Capacity
**Formula:**
`Over / Under Capacity (weeks) = Total Planned Work - Total Weeks Available`

**Interpretation:**
- Positive value = over capacity
- Negative value = under capacity
- Zero = fully allocated

---

## Output Template

# IC Capacity Summary

- **IC Name:**
- **IC Role:**
- **Quarter:**

## Capacity Utilization
**IC Capacity Utilization: X%**

## Summary Calculations
- **Total weeks in quarter:**
- **Total time off:**
- **Total weeks available:**
- **Number of domains supported:**
- **Domain names:**

## Planned Work by Domain
- **[Domain Name]:** X weeks
  - **[Project Title]:** X weeks
  - **[Project Title]:** X weeks

- **[Domain Name]:** X weeks
  - **[Project Title]:** X weeks
  - **[Project Title]:** X weeks

## Total Planned Work
- **Total planned work:**
- **Over/Under capacity:**
- **Is the IC over or under capacity?:** Yes / No — over capacity or under capacity

## Note for Team Discussion
[IC Name] has **X.X weeks of total time off** this quarter, including **[OKR time], [PTO], [Development days], and [Holidays]**. They are supporting **X domain(s)** with **X planned work item(s)**. At **X% utilization**, [IC Name] is **over / near / under capacity**, which suggests **[clear implication for prioritization, scope adjustment, moving work out of quarter, or room for additional work]**.

---

## Status Interpretation

### Under Capacity (< 90% utilization)
- Suggests there may be room for additional work or unplanned initiatives
- Opportunity to take on stretch projects or provide support to other areas

### Fully Allocated (90-100% utilization)
- Suggests the plan is well-balanced but leaves little room for unexpected work or scope changes
- Requires careful prioritization and risk management

### Over Capacity (> 100% utilization)
- Suggests the current quarter plan may not be feasible as scoped
- Consider whether all efforts are required in-quarter or if items should be reduced in scope, reprioritized, or moved out of quarter

---

## Example Output

# IC Capacity Summary

- **IC Name:** Sarah Chen
- **IC Role:** Senior Product Manager
- **Quarter:** Q2 2024

## Capacity Utilization
**IC Capacity Utilization: 95%**

## Summary Calculations
- **Total weeks in quarter:** 13.0
- **Total time off:** 1.2 weeks
- **Total weeks available:** 11.8 weeks
- **Number of domains supported:** 2
- **Domain names:** Platform, Data Infrastructure

## Planned Work by Domain
- **Platform:** 6.0 weeks
  - **Redesign checkout flow:** 3 weeks
  - **Mobile app optimization:** 2 weeks
  - **Bug fixes and polish:** 1 week

- **Data Infrastructure:** 5.2 weeks
  - **Analytics dashboard migration:** 4 weeks
  - **Data quality improvements:** 1.2 weeks

## Total Planned Work
- **Total planned work:** 11.2 weeks
- **Over/Under capacity:** Under by 0.6 weeks
- **Is the IC over or under capacity?:** No — near fully allocated

## Note for Team Discussion
Sarah has **1.2 weeks of total time off** this quarter, including **3 days of PTO and 2 holiday days**. She is supporting **2 domains** with **5 planned work items**. At **95% utilization**, Sarah is **fully allocated**, which suggests the plan is well-balanced but leaves little room for unexpected work or scope changes. Continue to monitor for emerging priorities that may require reprioritization.
