const STORAGE_KEYS = {
  ICS: 'capacity-planning-ics',
  ACTIVE_ID: 'capacity-planning-active-id',
  VERSION: 'capacity-planning-version'
};

const CURRENT_VERSION = 1;

/**
 * Load all ICs from localStorage
 */
export const loadICs = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ICS);
    if (!data) return [];
    return JSON.parse(data);
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
