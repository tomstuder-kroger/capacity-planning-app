import calendar from '../data/krogerFiscalCalendar.json';

/**
 * Returns the date the Kroger fiscal year starts for a given calendar year.
 * Kroger fiscal year starts on the Saturday nearest to January 31.
 */
function getFiscalYearStart(year) {
  const jan31 = new Date(year, 0, 31);
  const dayOfWeek = jan31.getDay(); // 0=Sun ... 6=Sat

  // Find the previous Saturday
  const daysSinceSat = (dayOfWeek - 6 + 7) % 7;
  const prevSat = new Date(jan31);
  prevSat.setDate(jan31.getDate() - daysSinceSat);

  // Check if the next Saturday is closer
  const nextSat = new Date(prevSat);
  nextSat.setDate(prevSat.getDate() + 7);

  return Math.abs(jan31 - prevSat) <= Math.abs(nextSat - jan31) ? prevSat : nextSat;
}

/**
 * Returns the current Kroger fiscal period based on today's date.
 * Returns { fiscalYear, quarter, weeksInQuarter } or null if out of range.
 */
export function getCurrentFiscalPeriod(today = new Date()) {
  // Search from the most recent possible fiscal year backward
  const searchYear = today.getFullYear() + 1;

  for (let year = searchYear; year >= searchYear - 2; year--) {
    const fyStart = getFiscalYearStart(year);
    if (today >= fyStart) {
      const daysSinceStart = Math.floor((today - fyStart) / (1000 * 60 * 60 * 24));
      const weeksSinceStart = Math.floor(daysSinceStart / 7);

      let quarter;
      if (weeksSinceStart < 13) quarter = 'Q1';
      else if (weeksSinceStart < 26) quarter = 'Q2';
      else if (weeksSinceStart < 39) quarter = 'Q3';
      else quarter = 'Q4';

      const weeksInQuarter = getQuarterWeeks(year, quarter);

      return { fiscalYear: year, quarter, weeksInQuarter };
    }
  }

  return null;
}

/**
 * Returns the number of weeks in a given fiscal quarter from the calendar data.
 */
export function getQuarterWeeks(fiscalYear, quarter) {
  const fy = calendar.fiscal_years.find(f => f.fiscal_year === fiscalYear);
  return fy?.quarters?.[quarter]?.weeks ?? 13;
}

/**
 * Returns all quarters for a given fiscal year from the calendar data.
 */
export function getFiscalYearData(fiscalYear) {
  return calendar.fiscal_years.find(f => f.fiscal_year === fiscalYear) ?? null;
}

export default calendar;
