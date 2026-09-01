import { renderHook, act } from '@testing-library/react';
import { CapacityProvider, useCapacity } from './CapacityContext';

const wrapper = ({ children }) => <CapacityProvider>{children}</CapacityProvider>;

beforeEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    // localStorage unavailable in this test environment; each test uses a fresh provider anyway
  }
});

test('re-importing a previously exported IC updates it in place instead of duplicating', () => {
  const { result } = renderHook(() => useCapacity(), { wrapper });

  act(() => {
    result.current.importIC({
      icName: 'Jane Smith',
      icRole: 'Senior Engineer',
      quarter: 'Q3 2026',
      weeksInQuarter: 12,
      timeOff: { okrTime: { value: 0, unit: 'days' }, devDays: 0, holidayDays: 0 },
      ptoInstances: [],
      domains: []
    });
  });

  expect(result.current.ics).toHaveLength(1);
  const exported = { ...result.current.ics[0] };

  act(() => {
    result.current.importIC(exported);
  });

  expect(result.current.ics).toHaveLength(1);
  expect(result.current.ics[0].id).toBe(exported.id);
});

test('importing an IC with no id creates a new entry', () => {
  const { result } = renderHook(() => useCapacity(), { wrapper });

  act(() => {
    result.current.importIC({
      icName: 'Alex Doe',
      icRole: 'Designer',
      quarter: 'Q3 2026',
      weeksInQuarter: 12,
      timeOff: { okrTime: { value: 0, unit: 'days' }, devDays: 0, holidayDays: 0 },
      ptoInstances: [],
      domains: []
    });
  });

  expect(result.current.ics).toHaveLength(1);
});
