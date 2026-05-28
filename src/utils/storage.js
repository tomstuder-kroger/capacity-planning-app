import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  ICS: 'capacity-planning-ics',
  ACTIVE_ID: 'capacity-planning-active-id',
  VERSION: 'capacity-planning-version',
  TEAM_NAME: 'capacity-planning-team-name',
  APPLIED_IMPORTS: 'capacity-planning-applied-imports'
};

const CURRENT_VERSION = 1;

/**
 * Migrate IC data to support new ptoInstances format
 * Checks if IC already has ptoInstances property
 * If not, initializes it as empty array and removes ptoDays if present
 */
export const migrateICData = (ic) => {
  // If already migrated, return unchanged
  if (ic.ptoInstances) {
    return ic;
  }

  // Migrate by initializing ptoInstances and cleaning up old ptoDays
  const migratedIC = {
    ...ic,
    ptoInstances: []
  };

  // Remove ptoDays from timeOff object if present
  if (migratedIC.timeOff && migratedIC.timeOff.ptoDays) {
    const { ptoDays, ...timeOffWithoutPTO } = migratedIC.timeOff;
    migratedIC.timeOff = timeOffWithoutPTO;
  }

  return migratedIC;
};

/**
 * Load all ICs from localStorage
 */
export const loadICs = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ICS);
    if (!data) return [];
    const ics = JSON.parse(data);
    // Apply migration to all ICs
    return ics.map(ic => migrateICData(ic));
  } catch (error) {
    console.error('Failed to load ICs from localStorage:', error);
    return [];
  }
};

/**
 * Save all ICs to localStorage
 */
export const saveICs = (ics) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ICS, JSON.stringify(ics));
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION.toString());
    return true;
  } catch (error) {
    console.error('Failed to save ICs to localStorage:', error);
    return false;
  }
};

/**
 * Load active IC ID from localStorage
 */
export const loadActiveICId = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
  } catch (error) {
    console.error('Failed to load active IC ID:', error);
    return null;
  }
};

/**
 * Save active IC ID to localStorage
 */
export const saveActiveICId = (id) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
    return true;
  } catch (error) {
    console.error('Failed to save active IC ID:', error);
    return false;
  }
};

/**
 * Load team name from localStorage
 */
export const loadTeamName = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TEAM_NAME) || '';
  } catch (error) {
    return '';
  }
};

/**
 * Save team name to localStorage
 */
export const saveTeamName = (name) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEAM_NAME, name);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Merges mural import batches into the current IC list non-destructively.
 * Each batch is only applied once (tracked by ID in localStorage).
 * For each person: finds existing IC by name (case-insensitive) or creates one.
 * For each domain: finds existing or creates it, then appends only new projects (matched by title).
 *
 * @param {Array} currentICs - ICs already loaded from localStorage
 * @param {Array} importBatches - Array of { id, domain, people: [{ name, projects: [{ title, weeks }] }] }
 * @returns {Array} Updated ICs (may be unchanged if all batches already applied)
 */
export const mergeImportedData = (currentICs, importBatches) => {
  if (!Array.isArray(importBatches) || importBatches.length === 0) return currentICs;

  let appliedIds;
  try {
    appliedIds = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLIED_IMPORTS) || '[]'));
  } catch {
    appliedIds = new Set();
  }

  let ics = [...currentICs];
  let changed = false;

  for (const batch of importBatches) {
    if (!batch.id || appliedIds.has(batch.id)) continue;

    for (const person of (batch.people || [])) {
      const nameLower = (person.name || '').toLowerCase().trim();
      if (!nameLower) continue;

      let icIndex = ics.findIndex(ic => ic.icName.toLowerCase().trim() === nameLower);

      if (icIndex === -1) {
        ics.push({
          id: uuidv4(),
          icName: person.name,
          icRole: '',
          quarter: '',
          weeksInQuarter: '',
          timeOff: { okrTime: { value: '', unit: 'days' }, devDays: '', holidayDays: '' },
          ptoInstances: [],
          domains: [],
          lastModified: new Date().toISOString()
        });
        icIndex = ics.length - 1;
      }

      const ic = { ...ics[icIndex], domains: [...ics[icIndex].domains] };
      const domainName = batch.domain || 'Imported';
      const domainNameLower = domainName.toLowerCase();
      let domainIndex = ic.domains.findIndex(d => d.name.toLowerCase() === domainNameLower);

      if (domainIndex === -1) {
        ic.domains.push({ id: uuidv4(), name: domainName, projects: [] });
        domainIndex = ic.domains.length - 1;
      }

      const domain = { ...ic.domains[domainIndex], projects: [...ic.domains[domainIndex].projects] };
      const existingTitles = new Set(domain.projects.map(p => p.title.toLowerCase().trim()));

      for (const proj of (person.projects || [])) {
        if (!proj.title || existingTitles.has(proj.title.toLowerCase().trim())) continue;
        domain.projects.push({
          id: uuidv4(),
          title: proj.title,
          weeksMode: 'fixed',
          weeks: proj.weeks || 1,
          startDate: null,
          customEndDate: null
        });
        existingTitles.add(proj.title.toLowerCase().trim());
      }

      ic.domains[domainIndex] = domain;
      ic.lastModified = new Date().toISOString();
      ics[icIndex] = ic;
    }

    appliedIds.add(batch.id);
    changed = true;
  }

  if (changed) {
    saveICs(ics);
    localStorage.setItem(STORAGE_KEYS.APPLIED_IMPORTS, JSON.stringify([...appliedIds]));
  }

  return ics;
};

/**
 * Export IC data as JSON file
 */
export const exportICAsJSON = (ic) => {
  const dataStr = JSON.stringify(ic, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `capacity-${ic.icName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);
};

/**
 * Export all ICs as JSON file
 */
export const exportAllICsAsJSON = (ics) => {
  const dataStr = JSON.stringify(ics, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `capacity-all-ics-${new Date().toISOString().split('T')[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);
};

/**
 * Validate imported IC data structure
 */
export const validateICData = (data) => {
  if (!data || typeof data !== 'object') return false;
  if (!data.icName || !data.icRole || !data.quarter) return false;
  if (typeof data.weeksInQuarter !== 'number') return false;
  if (!data.timeOff || !Array.isArray(data.domains)) return false;
  return true;
};
