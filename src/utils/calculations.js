/**
 * Calculates total time off in weeks based on OKR period and time off days
 * @param {Object} params - Time off parameters
 * @param {number} params.okrWeeks - OKR period in weeks (optional)
 * @param {number} params.okrDays - OKR period in days (optional)
 * @param {number} params.pto - PTO days
 * @param {number} params.dev - Dev days
 * @param {number} params.holiday - Holiday days
 * @returns {number} Total time off in weeks
 */
export function calculateTimeOff({ okrWeeks, okrDays, pto = 0, dev = 0, holiday = 0 } = {}) {
  // Validate and sanitize inputs
  const sanitizedPto = typeof pto === 'number' && pto >= 0 ? pto : 0;
  const sanitizedDev = typeof dev === 'number' && dev >= 0 ? dev : 0;
  const sanitizedHoliday = typeof holiday === 'number' && holiday >= 0 ? holiday : 0;

  if (okrWeeks !== undefined && okrWeeks !== null) {
    const sanitizedOkrWeeks = typeof okrWeeks === 'number' && okrWeeks >= 0 ? okrWeeks : 0;
    // If OKR in weeks: okrWeeks + ((pto + dev + holiday) / 5)
    return sanitizedOkrWeeks + ((sanitizedPto + sanitizedDev + sanitizedHoliday) / 5);
  } else if (okrDays !== undefined && okrDays !== null) {
    const sanitizedOkrDays = typeof okrDays === 'number' && okrDays >= 0 ? okrDays : 0;
    // If OKR in days: (okrDays + pto + dev + holiday) / 5
    return (sanitizedOkrDays + sanitizedPto + sanitizedDev + sanitizedHoliday) / 5;
  } else {
    // Neither okrWeeks nor okrDays provided - return just time off
    return (sanitizedPto + sanitizedDev + sanitizedHoliday) / 5;
  }
}

/**
 * Calculates weeks for a single project based on its mode.
 * Fixed mode uses the stored weeks value; custom mode derives weeks from date range.
 * @param {Object} project - Project object
 * @returns {number} Weeks for this project
 */
export function getProjectWeeks(project) {
  if (!project) return 0;
  if (project.weeksMode === 'custom') {
    if (!project.startDate || !project.customEndDate) return 0;
    const start = new Date(project.startDate);
    const end = new Date(project.customEndDate);
    const diffMs = end - start;
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
  }
  const weeks = Number(project.weeks);
  return !isNaN(weeks) && weeks > 0 ? weeks : 0;
}

/**
 * Calculates total PTO weeks from an array of PTO instances
 * @param {Array} ptoInstances - Array of PTO instances
 * @param {string} ptoInstances[].startDate - Start date in ISO format
 * @param {string} ptoInstances[].endDate - End date in ISO format
 * @returns {number} Total PTO weeks, calculated using Math.ceil from date ranges
 */
export function calculateTotalPTO(ptoInstances) {
  // Validate input is an array
  if (!Array.isArray(ptoInstances)) {
    return 0;
  }

  // Explicitly handle empty array
  if (ptoInstances.length === 0) {
    return 0;
  }

  return ptoInstances.reduce((totalWeeks, pto) => {
    // Skip if not a valid object
    if (!pto || typeof pto !== 'object') {
      return totalWeeks;
    }

    // Skip if either startDate or endDate is missing/invalid
    if (!pto.startDate || !pto.endDate) {
      return totalWeeks;
    }

    // Parse dates
    const startDate = new Date(pto.startDate);
    const endDate = new Date(pto.endDate);

    // Skip if dates are invalid or invalid range (start > end)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
      return totalWeeks;
    }

    // Calculate days difference (inclusive: same day counts as 1 day)
    const diffMs = endDate - startDate;
    const daysDiff = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;

    // Convert days to weeks using Math.ceil
    const weeksForPto = Math.ceil(daysDiff / 7);

    return totalWeeks + weeksForPto;
  }, 0);
}

/**
 * Calculates domain effort based on task sizes
 * @param {Object} params - Domain effort parameters
 * @param {number} params.small - Number of small tasks (2 weeks each)
 * @param {number} params.medium - Number of medium tasks (4 weeks each)
 * @param {number} params.large - Number of large tasks (8 weeks each)
 * @param {number} params.extraLarge - Number of extra large tasks (9 weeks each)
 * @returns {number} Total domain effort in weeks
 */
export function calculateDomainEffort({ small = 0, medium = 0, large = 0, extraLarge = 0 } = {}) {
  // Validate and sanitize inputs - ensure non-negative integers
  const sanitizedSmall = typeof small === 'number' && small >= 0 ? Math.floor(small) : 0;
  const sanitizedMedium = typeof medium === 'number' && medium >= 0 ? Math.floor(medium) : 0;
  const sanitizedLarge = typeof large === 'number' && large >= 0 ? Math.floor(large) : 0;
  const sanitizedExtraLarge = typeof extraLarge === 'number' && extraLarge >= 0 ? Math.floor(extraLarge) : 0;

  // Small = 2 weeks, Medium = 4 weeks, Large = 8 weeks, Extra Large = 9 weeks
  return (sanitizedSmall * 2) + (sanitizedMedium * 4) + (sanitizedLarge * 8) + (sanitizedExtraLarge * 9);
}

/**
 * Calculates total planned work across all domains
 * @param {Array<number>} domainEfforts - Array of domain effort values
 * @returns {number} Total planned work in days
 */
export function calculateTotalPlanned(domainEfforts) {
  // Validate input is an array
  if (!Array.isArray(domainEfforts)) {
    return 0;
  }

  // Explicitly handle empty array
  if (domainEfforts.length === 0) {
    return 0;
  }

  return domainEfforts.reduce((sum, effort) => {
    // Ensure each effort value is a valid non-negative number
    const sanitizedEffort = typeof effort === 'number' && effort >= 0 ? effort : 0;
    return sum + sanitizedEffort;
  }, 0);
}

/**
 * Calculates capacity utilization percentage
 * @param {number} totalPlanned - Total planned work in days
 * @param {number} totalAvailable - Total available capacity in days
 * @returns {number} Utilization percentage
 */
export function calculateUtilization(totalPlanned, totalAvailable) {
  // Validate inputs are numbers and non-negative
  const sanitizedPlanned = typeof totalPlanned === 'number' && totalPlanned >= 0 ? totalPlanned : 0;
  const sanitizedAvailable = typeof totalAvailable === 'number' && totalAvailable >= 0 ? totalAvailable : 0;

  if (sanitizedAvailable === 0) return 0;
  return (sanitizedPlanned / sanitizedAvailable) * 100;
}

/**
 * Determines capacity status based on utilization percentage
 * @param {number} utilization - Utilization percentage
 * @returns {string} Status: "over", "fully", or "under"
 */
export function calculateStatus(utilization) {
  // Validate utilization is a number and handle special cases
  if (typeof utilization !== 'number' || !isFinite(utilization)) {
    return 'under'; // Default to under for invalid values
  }

  if (utilization > 100) return 'over';
  if (utilization >= 90) return 'fully';
  return 'under';
}

/**
 * Generates a formatted summary of capacity planning matching the methodology template
 * @param {Object} ic - IC data object
 * @param {Object} calculated - Calculated results object
 * @returns {string} Formatted summary text
 */
export function generateSummary(ic, calculated) {
  if (!ic || !calculated) {
    return 'No data available';
  }

  const {
    totalWeeksInQuarter,
    totalTimeOffWeeks,
    totalWeeksAvailable,
    domainEfforts,
    totalPlannedWork,
    capacityUtilization,
    overUnderCapacity,
    status
  } = calculated;

  // Format domain names list
  const domainNames = ic.domains.map(d => d.name).join(', ') || 'None';

  // Count total projects across all domains
  const totalProjects = ic.domains.reduce((sum, d) => sum + (d.projects ? d.projects.length : 0), 0);

  // Determine over/under text
  let overUnderText;
  if (overUnderCapacity > 0) {
    overUnderText = `Over by ${Math.abs(overUnderCapacity).toFixed(1)} weeks`;
  } else if (overUnderCapacity < 0) {
    overUnderText = `Under by ${Math.abs(overUnderCapacity).toFixed(1)} weeks`;
  } else {
    overUnderText = 'Exactly at capacity';
  }

  const isOverUnder = status === 'over' ? 'Yes — over capacity' :
                      status === 'fully' ? 'Yes — fully allocated' :
                      'No — under capacity';

  // Build time off description
  const timeOffParts = [];
  if (ic.timeOff.okrTime.unit === 'weeks' && ic.timeOff.okrTime.value > 0) {
    timeOffParts.push(`${ic.timeOff.okrTime.value} weeks of OKR time`);
  } else if (ic.timeOff.okrTime.unit === 'days' && ic.timeOff.okrTime.value > 0) {
    timeOffParts.push(`${ic.timeOff.okrTime.value} days of OKR time`);
  }
  // Add scheduled PTO instances to timeOffParts
  if (ic.ptoInstances && ic.ptoInstances.length > 0) {
    ic.ptoInstances.forEach(p => {
      const dateRange = `${p.startDate} to ${p.endDate}`;
      timeOffParts.push(`${p.type} (${dateRange})`);
    });
  }
  if (ic.timeOff.devDays > 0) timeOffParts.push(`${ic.timeOff.devDays} development days`);
  if (ic.timeOff.holidayDays > 0) timeOffParts.push(`${ic.timeOff.holidayDays} holiday days`);
  const timeOffDesc = timeOffParts.join(', ') || 'no time off';

  // Capacity status description
  let capacityDesc;
  if (status === 'over') {
    capacityDesc = 'over capacity, which suggests the current quarter plan may not be feasible as scoped. Consider whether all efforts are required in-quarter or if items should be reduced in scope, reprioritized, or moved out of quarter.';
  } else if (status === 'fully') {
    capacityDesc = 'fully allocated, which suggests the plan is well-balanced but leaves little room for unexpected work or scope changes.';
  } else {
    capacityDesc = 'under capacity, which suggests there may be room for additional work or unplanned initiatives.';
  }

  // Build the formatted output
  let output = `# IC Capacity Summary

- **IC Name:** ${ic.icName || 'N/A'}
- **IC Role:** ${ic.icRole || 'N/A'}
- **Quarter:** ${ic.quarter || 'N/A'}

## Capacity Utilization
**IC Capacity Utilization: ${capacityUtilization.toFixed(0)}%**

## Summary Calculations
- **Total weeks in quarter:** ${totalWeeksInQuarter.toFixed(1)}
- **Total time off:** ${totalTimeOffWeeks.toFixed(1)} weeks
- **Total weeks available:** ${totalWeeksAvailable.toFixed(1)} weeks
- **Number of domains supported:** ${ic.domains.length}
- **Domain names:** ${domainNames}

## Planned Work by Domain
`;

  // Add each domain's breakdown
  domainEfforts.forEach((effort) => {
    output += `- **${effort.domainName}:** ${effort.totalWeeks.toFixed(1)} weeks\n`;
    if (effort.projects && effort.projects.length > 0) {
      effort.projects.forEach(p => {
        const wks = p.weeks;
        output += `  - **${p.title || 'Untitled'}:** ${wks} week${wks !== 1 ? 's' : ''}\n`;
      });
    }
    output += '\n';
  });

  output += `## Total Planned Work
- **Total planned work:** ${totalPlannedWork.toFixed(1)} weeks
- **Over/Under capacity:** ${overUnderText}
- **Is the IC over or under capacity?:** ${isOverUnder}

## Note for Team Discussion
${ic.icName || 'This IC'} has ${totalTimeOffWeeks.toFixed(1)} weeks of total time off this quarter, including ${timeOffDesc}. They are supporting ${ic.domains.length} domain(s) with ${totalProjects} planned project(s). At ${capacityUtilization.toFixed(0)}% utilization, ${ic.icName || 'this IC'} is ${capacityDesc}`;

  return output;
}
