import { describe, it, expect } from 'vitest';
import { dedupeICsByName } from './storage';

const makeIC = (icName, lastModified, projectCount = 0) => ({
  id: `${icName}-${lastModified}-${Math.random()}`,
  icName,
  domains: projectCount > 0 ? [{ projects: Array(projectCount).fill({}) }] : [],
  lastModified,
});

describe('dedupeICsByName', () => {
  it('keeps a single record per name unchanged', () => {
    const ics = [makeIC('Jane Smith', '2026-08-01T00:00:00.000Z')];
    expect(dedupeICsByName(ics)).toHaveLength(1);
  });

  it('collapses re-imported duplicates, keeping the most recently modified', () => {
    const older = makeIC('Colin Johnston', '2026-07-14T14:49:06.362Z');
    const newer = makeIC('Colin Johnston', '2026-08-31T20:37:57.598Z');
    const result = dedupeICsByName([older, newer]);
    expect(result).toHaveLength(1);
    expect(result[0].lastModified).toBe(newer.lastModified);
  });

  it('is case/whitespace-insensitive when matching names', () => {
    const a = makeIC('colin johnston ', '2026-07-14T14:49:06.362Z');
    const b = makeIC(' Colin Johnston', '2026-08-31T20:37:57.598Z');
    expect(dedupeICsByName([a, b])).toHaveLength(1);
  });

  it('reproduces the real-world 49-record scenario: 3 batches collapse to 1 per name', () => {
    const names = Array.from({ length: 18 }, (_, i) => `Person ${i}`);
    const organic = names.map((n, i) =>
      makeIC(n, new Date(2026, 7, i + 1).toISOString())
    );
    // Two bulk-import batches, each stamping every record with one shared
    // timestamp - the exact pattern that produced the live duplicate bug.
    const batch1 = names
      .slice(0, 16)
      .map(n => makeIC(n, '2026-08-18T13:26:28.792Z'));
    const batch2 = names
      .slice(0, 17)
      .map(n => makeIC(n, '2026-09-01T14:07:06.276Z'));

    const all = [...organic, ...batch1, ...batch2];
    expect(all).toHaveLength(18 + 16 + 17);

    const result = dedupeICsByName(all);
    expect(result).toHaveLength(18);
    // Every survivor should carry the latest of its group's timestamps.
    const byName = Object.fromEntries(result.map(ic => [ic.icName, ic]));
    expect(byName['Person 0'].lastModified).toBe('2026-09-01T14:07:06.276Z');
    expect(byName['Person 17'].lastModified).toBe(organic[17].lastModified);
  });

  it('on an exact-timestamp tie, keeps the record with more project data', () => {
    const thin = makeIC('Tied Person', '2026-09-01T14:07:06.276Z', 0);
    const rich = makeIC('Tied Person', '2026-09-01T14:07:06.276Z', 3);
    const result = dedupeICsByName([thin, rich]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(rich);
  });

  it('always keeps records with no name (e.g. a brand-new blank IC)', () => {
    const blankA = makeIC('', '2026-09-01T00:00:00.000Z');
    const blankB = makeIC('', '2026-09-01T00:00:00.000Z');
    expect(dedupeICsByName([blankA, blankB])).toHaveLength(2);
  });
});
