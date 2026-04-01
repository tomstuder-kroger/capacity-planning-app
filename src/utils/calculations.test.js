import {
  calculateTimeOff,
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

  describe('calculateDomainEffort', () => {
    test('calculates domain effort with mixed task sizes', () => {
      const result = calculateDomainEffort({
        small: 3,
        medium: 2,
        large: 1,
      });
      expect(result).toBe(22);
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
            smallProjects: 0,
            mediumProjects: 0,
            largeProjects: 2
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
            breakdown: { smallWeeks: 0, mediumWeeks: 0, largeWeeks: 16 }
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
