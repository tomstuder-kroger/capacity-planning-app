import calendar from '../data/krogerFiscalCalendar.json';

/**
 * Returns the date the Kroger fiscal year starts for a given fiscal year.
 * Uses the confirmed start_date from the calendar JSON when available.
 * Fallback: Sunday nearest to February 1 (Kroger weeks begin on Sunday).
 */
function getFiscalYearStart(year) {
  const fy = calendar.fiscal_years.find(f => f.fiscal_year === year);
  if (fy?.start_date) {
    return new Date(fy.start_date + 'T00:00:00');
  }

  // Fallback heuristic: Sunday nearest Feb 1
  const feb1 = new Date(year, 1, 1);
  const dow = feb1.getDay(); // 0=Sun
  const daysToNearestSun = dow === 0 ? 0 : dow <= 3 ? -dow : 7 - dow;
  const result = new Date(feb1);
  result.setDate(feb1.getDate() + daysToNearestSun);
  return result;
}

/**
 * Returns the current Kroger fiscal period based on today's date.
 * Returns { fiscalYear, quarter, weeksInQuarter } or null if out of range.
 */
export function getCurrentFiscalPeriod(today = new Date()) {
  const searchYear = today.getFullYear() + 1;

  for (let year = searchYear; year >= searchYear - 2; year--) {
    const fyStart = getFiscalYearStart(year);
    if (today < fyStart) continue;

    const fyData = getFiscalYearData(year);
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

    // Use confirmed quarter start dates when available
    if (fyData?.quarters?.Q1?.start_date) {
      for (let i = quarters.length - 1; i >= 0; i--) {
        const q = quarters[i];
        const qStart = new Date(fyData.quarters[q].start_date + 'T00:00:00');
        if (today >= qStart) {
          return { fiscalYear: year, quarter: q, weeksInQuarter: fyData.quarters[q].weeks ?? 13 };
        }
      }
    } else {
      // Fallback: use 13-week boundaries
      const daysSinceStart = Math.floor((today - fyStart) / (1000 * 60 * 60 * 24));
      const weeksSinceStart = Math.floor(daysSinceStart / 7);
      let quarter;
      if (weeksSinceStart < 13) quarter = 'Q1';
      else if (weeksSinceStart < 26) quarter = 'Q2';
      else if (weeksSinceStart < 39) quarter = 'Q3';
      else quarter = 'Q4';
      return { fiscalYear: year, quarter, weeksInQuarter: getQuarterWeeks(year, quarter) };
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

/**
 * Returns the calendar Date on which a fiscal quarter begins.
 * Uses confirmed start_date from JSON when available; otherwise offsets from FY start.
 */
export function getQuarterStartDate(fiscalYear, quarter) {
  const fyData = getFiscalYearData(fiscalYear);
  const qData = fyData?.quarters?.[quarter];

  if (qData?.start_date) {
    return new Date(qData.start_date + 'T00:00:00');
  }

  // Fallback: offset from FY start by summing preceding quarter weeks
  const fyStart = getFiscalYearStart(fiscalYear);
  const qWeeks = q => fyData?.quarters?.[q]?.weeks ?? 13;

  const weekOffset =
    quarter === 'Q2' ? qWeeks('Q1') :
    quarter === 'Q3' ? qWeeks('Q1') + qWeeks('Q2') :
    quarter === 'Q4' ? qWeeks('Q1') + qWeeks('Q2') + qWeeks('Q3') :
    0;

  const start = new Date(fyStart);
  start.setDate(fyStart.getDate() + weekOffset * 7);
  return start;
}

export default calendar;
