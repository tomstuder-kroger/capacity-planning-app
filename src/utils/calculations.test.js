import {
  calculateTimeOff,
  calculateTotalPTO,
  calculateDomainEffort,
  calculateTotalPlanned,
  calculateUtilization,
  calculateStatus,
  generateSummary,
} from './calculations';

describe('Capacity Planning Calculations', () => {
  describe('calculateTimeOff', () => {
    test('calculates time off when OKR is in weeks', () => {
      const result = calculateTimeOff({
        okrWeeks: 12,
        pto: 5,
        dev: 2,
        holiday: 3,
      });
      expect(result).toBe(14);
    });

    test('calculates time off when OKR is in days', () => {
      const result = calculateTimeOff({
        okrDays: 60,
        pto: 5,
        dev: 2,
        holiday: 3,
      });
      expect(result).toBe(14);
    });

    test('handles zero time off values', () => {
      const result = calculateTimeOff({
        okrWeeks: 12,
        pto: 0,
        dev: 0,
        holiday: 0,
      });
      expect(result).toBe(12);
    });

    test('handles negative values by converting to 0', () => {
      const result = calculateTimeOff({
        okrWeeks: 12,
        pto: -5,
        dev: -2,
        holiday: -3,
      });
      expect(result).toBe(12);
    });

    test('handles negative okrWeeks by converting to 0', () => {
      const result = calculateTimeOff({
        okrWeeks: -10,
        pto: 5,
        dev: 2,
        holiday: 3,
      });
      expect(result).toBe(2);
    });

    test('handles missing timeOffData object', () => {
      const result = calculateTimeOff();
      expect(result).toBe(0);
    });

    test('handles null okrWeeks and okrDays', () => {
      const result = calculateTimeOff({
        okrWeeks: null,
        okrDays: null,
        pto: 5,
        dev: 2,
        holiday: 3,
      });
      expect(result).toBe(2);
    });

    test('handles undefined okrWeeks and okrDays', () => {
      const result = calculateTimeOff({
        pto: 5,
        dev: 2,
        holiday: 3,
      });
      expect(result).toBe(2);
    });

    test('handles non-numeric values', () => {
      const result = calculateTimeOff({
        okrWeeks: 'invalid',
        pto: 'invalid',
        dev: null,
        holiday: undefined,
      });
      expect(result).toBe(0);
    });
  });

  describe('calculateTotalPTO', () => {
    test('returns 0 for empty array', () => {
      const result = calculateTotalPTO([]);
      expect(result).toBe(0);
    });

    test('returns 0 for null input', () => {
      const result = calculateTotalPTO(null);
      expect(result).toBe(0);
    });

    test('returns 0 for undefined input', () => {
      const result = calculateTotalPTO(undefined);
      expect(result).toBe(0);
    });

    test('calculates single day PTO (start equals end date)', () => {
      const result = calculateTotalPTO([
        {
          id: 'pto1',
          startDate: '2024-01-15',
          endDate: '2024-01-15',
          type: 'vacation'
        }
      ]);
      // Single day = 1 day = Math.ceil(1 / 7) = 1 week
      expect(result).toBe(1);
    });

    test('calculates multi-day PTO (5 days)', () => {
      const result = calculateTotalPTO([
        {
          id: 'pto1',
          startDate: '2024-01-15',
          endDate: '2024-01-19',
          type: 'vacation'
        }
      ]);
      // 5 days = Math.ceil(5 / 7) = 1 week
      expect(result).toBe(1);
    });

    test('calculates full week PTO (7 days)', () => {
      const result = calculateTotalPTO([
        {
          id: 'pto1',
          startDate: '2024-01-15',
          endDate: '2024-01-21',
          type: 'vacation'
        }
      ]);
      // 7 days = Math.ceil(7 / 7) = 1 week
      expect(result).toBe(1);
    });

    test('calculates full week PTO (8 days)', () => {
      const result = calculateTotalPTO([
        {
          id: 'pto1',
          startDate: '2024-01-15',
          endDate: '2024-01-22',
          type: 'vacation'
        }
      ]);
      // 8 days = Math.ceil(8 / 7) = 2 weeks
      expect(result).toBe(2);
    });

    test('aggregates multiple PTO instances correctly', () => {
      const result = calculateTotalPTO([
        {
          id: 'pto1',
          startDate: '2024-01-15',
          endDate: '2024-01-19',
          type: 'vacation'
        },
        {
          id: 'pto2',
          startDate: '2024-02-05',
          endDate: '2024-02-11',
          type: 'vacation'
        }
      ]);
      // First: 5 days = Math.ceil(5 / 7) = 1 week
      // Second: 7 days = Math.ceil(7 / 7) = 1 week
      // Total: 2 weeks
      expect(result).toBe(2);
    });

    test('aggregates multiple PTO instances with different day ranges', () => {
      const result = calculateTotalPTO([
        {
          id: 'pto1',
          startDate: '2024-01-15',
          endDate: '2024-01-21',
          type: 'vacation'
        },
        {
          id: 'pto2',
          startDate: '2024-02-01',
          endDate: '2024-02-08',
          type: 'vacation'
        },
        {
          id: 'pto3',
          startDate: '2024-03-10',
          endDate: '2024-03-12',
          type: 'sick'
        }
      ]);
      // First: 7 days = Math.ceil(7 / 7) = 1 week
      // Second: 8 days = Math.ceil(8 / 7) = 2 weeks
      // Third: 3 days = Math.ceil(3 / 7) = 1 week
      // Total: 4 weeks
      expect(result).toBe(4);
    });

    test('ignores PTO instances with missing startDate', () => {
      const result = calculateTotalPTO([
        {
          id: 'pto1',
          startDate: null,
          endDate: '2024-01-19',
          type: 'vacation'
        },
        {
          id: 'pto2',
          startDate: '2024-02-05',
          endDate: '2024-02-11',
          type: 'vacation'
        }
      ]);
      // First instance ignored due to missing startDate
      // Second: 7 days = Math.ceil(7 / 7) = 1 week
      expect(result).toBe(1);
    });

    test('ignores PTO instances with missing endDate', () => {
      const result = calculateTotalPTO([
        {
          id: 'pto1',
          startDate: '2024-01-15',
          endDate: null,
          type: 'vacation'
        },
        {
          id: 'pto2',
          startDate: '2024-02-05',
          endDate: '2024-02-11',
          type: 'vacation'
        }
      ]);
      // First instance ignored due to missing endDate
      // Second: 7 days = Math.ceil(7 / 7) = 1 week
      expect(result).toBe(1);
    });

    test('ignores PTO instances with missing both dates', () => {
      const result = calculateTotalPTO([
        {
          id: 'pto1',
          startDate: undefined,
          endDate: undefined,
          type: 'vacation'
        }
      ]);
      // Instance ignored due to missing dates
      expect(result).toBe(0);
    });

    test('ignores PTO instances with invalid range (start > end)', () => {
      const result = calculateTotalPTO([
        {
          id: 'pto1',
          startDate: '2024-01-19',
          endDate: '2024-01-15',
          type: 'vacation'
        },
        {
          id: 'pto2',
          startDate: '2024-02-05',
          endDate: '2024-02-11',
          type: 'vacation'
        }
      ]);
      // First instance ignored due to invalid range
      // Second: 7 days = Math.ceil(7 / 7) = 1 week
      expect(result).toBe(1);
    });

    test('handles mixed valid and invalid PTO instances', () => {
      const result = calculateTotalPTO([
        {
          id: 'pto1',
          startDate: '2024-01-15',
          endDate: '2024-01-19',
          type: 'vacation'
        },
        {
          id: 'pto2',
          startDate: null,
          endDate: '2024-02-11',
          type: 'vacation'
        },
        {
          id: 'pto3',
          startDate: '2024-03-05',
          endDate: '2024-03-10',
          type: 'sick'
        }
      ]);
      // First: 5 days = Math.ceil(5 / 7) = 1 week
      // Second: ignored (missing startDate)
      // Third: 6 days = Math.ceil(6 / 7) = 1 week
      // Total: 2 weeks
      expect(result).toBe(2);
    });

    test('ignores array elements that are not objects', () => {
      const result = calculateTotalPTO([
        {
          id: 'pto1',
          startDate: '2024-01-15',
          endDate: '2024-01-19',
          type: 'vacation'
        },
        null,
        undefined,
        'invalid',
        123
      ]);
      // Only first element is valid
      // First: 5 days = Math.ceil(5 / 7) = 1 week
      expect(result).toBe(1);
    });

    test('handles non-array input (returns 0)', () => {
      expect(calculateTotalPTO('invalid')).toBe(0);
      expect(calculateTotalPTO(123)).toBe(0);
      expect(calculateTotalPTO({})).toBe(0);
    });
  });

  describe('calculateDomainEffort', () => {
    test('calculates domain effort with mixed task sizes', () => {
      const result = calculateDomainEffort({
        small: 3,
        medium: 2,
        large: 1,
      });
      expect(result).toBe(22);
    });

    test('calculates domain effort with all task sizes including extra large', () => {
      const result = calculateDomainEffort({
        small: 2,
        medium: 1,
        large: 1,
        extraLarge: 1,
      });
      expect(result).toBe(25); // 2*2 + 1*4 + 1*8 + 1*9 = 4 + 4 + 8 + 9 = 25
    });

    test('calculates domain effort with only extra large tasks', () => {
      const result = calculateDomainEffort({
        small: 0,
        medium: 0,
        large: 0,
        extraLarge: 3,
      });
      expect(result).toBe(27); // 3 * 9 = 27
    });

    test('calculates domain effort with only small tasks', () => {
      const result = calculateDomainEffort({
        small: 5,
        medium: 0,
        large: 0,
      });
      expect(result).toBe(10);
    });

    test('calculates domain effort with no tasks', () => {
      const result = calculateDomainEffort({
        small: 0,
        medium: 0,
        large: 0,
      });
      expect(result).toBe(0);
    });

    test('handles negative values by converting to 0', () => {
      const result = calculateDomainEffort({
        small: -3,
        medium: -2,
        large: -1,
      });
      expect(result).toBe(0);
    });

    test('handles missing domain object', () => {
      const result = calculateDomainEffort();
      expect(result).toBe(0);
    });

    test('handles non-numeric values', () => {
      const result = calculateDomainEffort({
        small: 'invalid',
        medium: null,
        large: undefined,
      });
      expect(result).toBe(0);
    });

    test('converts float values to integers', () => {
      const result = calculateDomainEffort({
        small: 2.7,
        medium: 3.2,
        large: 1.9,
      });
      expect(result).toBe(24); // floor(2.7) * 2 + floor(3.2) * 4 + floor(1.9) * 8 = 2*2 + 3*4 + 1*8 = 4 + 12 + 8 = 24
    });

    test('converts float values to integers including extra large', () => {
      const result = calculateDomainEffort({
        small: 1.5,
        medium: 2.8,
        large: 1.2,
        extraLarge: 2.9,
      });
      expect(result).toBe(36); // floor(1.5)*2 + floor(2.8)*4 + floor(1.2)*8 + floor(2.9)*9 = 1*2 + 2*4 + 1*8 + 2*9 = 2 + 8 + 8 + 18 = 36
    });
  });

  describe('calculateTotalPlanned', () => {
    test('sums multiple domain efforts', () => {
      const result = calculateTotalPlanned([10, 15, 20, 5]);
      expect(result).toBe(50);
    });

    test('handles single domain', () => {
      const result = calculateTotalPlanned([25]);
      expect(result).toBe(25);
    });

    test('handles empty domains', () => {
      const result = calculateTotalPlanned([]);
      expect(result).toBe(0);
    });

    test('handles non-array input', () => {
      const result = calculateTotalPlanned('invalid');
      expect(result).toBe(0);
    });

    test('handles null input', () => {
      const result = calculateTotalPlanned(null);
      expect(result).toBe(0);
    });

    test('handles undefined input', () => {
      const result = calculateTotalPlanned(undefined);
      expect(result).toBe(0);
    });

    test('handles array with negative values', () => {
      const result = calculateTotalPlanned([10, -5, 20]);
      expect(result).toBe(30); // negative values converted to 0
    });

    test('handles array with non-numeric values', () => {
      const result = calculateTotalPlanned([10, 'invalid', 20, null, undefined]);
      expect(result).toBe(30); // non-numeric values converted to 0
    });
  });

  describe('calculateUtilization', () => {
    test('calculates utilization percentage', () => {
      const result = calculateUtilization(45, 50);
      expect(result).toBeCloseTo(90);
    });

    test('calculates over-capacity utilization', () => {
      const result = calculateUtilization(55, 50);
      expect(result).toBeCloseTo(110);
    });

    test('handles zero available capacity', () => {
      const result = calculateUtilization(50, 0);
      expect(result).toBe(0);
    });

    test('handles negative planned value', () => {
      const result = calculateUtilization(-50, 100);
      expect(result).toBe(0);
    });

    test('handles negative available value', () => {
      const result = calculateUtilization(50, -100);
      expect(result).toBe(0);
    });

    test('handles non-numeric planned value', () => {
      const result = calculateUtilization('invalid', 100);
      expect(result).toBe(0);
    });

    test('handles non-numeric available value', () => {
      const result = calculateUtilization(50, 'invalid');
      expect(result).toBe(0);
    });

    test('handles null values', () => {
      const result = calculateUtilization(null, null);
      expect(result).toBe(0);
    });

    test('handles undefined values', () => {
      const result = calculateUtilization(undefined, undefined);
      expect(result).toBe(0);
    });
  });

  describe('calculateStatus', () => {
    test('returns "over" for over-capacity', () => {
      const result = calculateStatus(110);
      expect(result).toBe('over');
    });

    test('returns "fully" for fully utilized capacity', () => {
      const result = calculateStatus(95);
      expect(result).toBe('fully');
    });

    test('returns "fully" at exactly 90%', () => {
      const result = calculateStatus(90);
      expect(result).toBe('fully');
    });

    test('returns "under" for under-capacity', () => {
      const result = calculateStatus(85);
      expect(result).toBe('under');
    });

    test('handles Infinity value', () => {
      const result = calculateStatus(Infinity);
      expect(result).toBe('under');
    });

    test('handles NaN value', () => {
      const result = calculateStatus(NaN);
      expect(result).toBe('under');
    });

    test('handles non-numeric value', () => {
      const result = calculateStatus('invalid');
      expect(result).toBe('under');
    });

    test('handles null value', () => {
      const result = calculateStatus(null);
      expect(result).toBe('under');
    });

    test('handles undefined value', () => {
      const result = calculateStatus(undefined);
      expect(result).toBe('under');
    });

    test('handles negative value', () => {
      const result = calculateStatus(-50);
      expect(result).toBe('under');
    });
  });

  describe('generateSummary', () => {
    test('generates formatted summary with all sections', () => {
      const ic = {
        icName: 'Joe Test',
        icRole: 'PD',
        quarter: 'Q2 2024',
        weeksInQuarter: 16,
        timeOff: {
          okrTime: { value: 2, unit: 'weeks' },
          ptoDays: 5,
          devDays: 1,
          holidayDays: 0
        },
        domains: [
          {
            id: '1',
            name: 'TEST',
            projects: [
              { id: 'p1', title: 'Alpha', startDate: null, weeksMode: 'fixed', weeks: 8, customEndDate: null },
              { id: 'p2', title: 'Beta', startDate: null, weeksMode: 'fixed', weeks: 8, customEndDate: null }
            ]
          }
        ]
      };

      const calculated = {
        totalWeeksInQuarter: 16,
        totalTimeOffWeeks: 3.2,
        totalWeeksAvailable: 12.8,
        domainEfforts: [
          {
            domainId: '1',
            domainName: 'TEST',
            totalWeeks: 16,
            projects: [
              { title: 'Alpha', weeks: 8 },
              { title: 'Beta', weeks: 8 }
            ]
          }
        ],
        totalPlannedWork: 16,
        capacityUtilization: 125,
        overUnderCapacity: 3.2,
        status: 'over'
      };

      const result = generateSummary(ic, calculated);

      expect(result).toContain('# IC Capacity Summary');
      expect(result).toContain('**IC Name:** Joe Test');
      expect(result).toContain('**IC Role:** PD');
      expect(result).toContain('**Quarter:** Q2 2024');
      expect(result).toContain('**IC Capacity Utilization: 125%**');
      expect(result).toContain('**Total weeks in quarter:** 16.0');
      expect(result).toContain('**Total time off:** 3.2 weeks');
      expect(result).toContain('**Total weeks available:** 12.8 weeks');
      expect(result).toContain('**Number of domains supported:** 1');
      expect(result).toContain('**Domain names:** TEST');
      expect(result).toContain('## Planned Work by Domain');
      expect(result).toContain('**TEST:** 16.0 weeks');
      expect(result).toContain('**Total planned work:** 16.0 weeks');
      expect(result).toContain('**Over/Under capacity:** Over by 3.2 weeks');
      expect(result).toContain('## Note for Team Discussion');
    });

    test('handles missing IC or calculated data', () => {
      expect(generateSummary(null, null)).toBe('No data available');
      expect(generateSummary(undefined, undefined)).toBe('No data available');
    });

    test('formats under capacity correctly', () => {
      const ic = {
        icName: 'Jane Doe',
        icRole: 'Engineer',
        quarter: 'Q1 2024',
        weeksInQuarter: 16,
        timeOff: { okrTime: { value: 0, unit: 'weeks' }, ptoDays: 0, devDays: 0, holidayDays: 0 },
        domains: []
      };

      const calculated = {
        totalWeeksInQuarter: 16,
        totalTimeOffWeeks: 0,
        totalWeeksAvailable: 16,
        domainEfforts: [],
        totalPlannedWork: 0,
        capacityUtilization: 0,
        overUnderCapacity: -16,
        status: 'under'
      };

      const result = generateSummary(ic, calculated);
      expect(result).toContain('No — under capacity');
      expect(result).toContain('Under by 16.0 weeks');
      expect(result).toContain('under capacity');
    });
  });
});
