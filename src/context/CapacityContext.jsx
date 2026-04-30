import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadICs, saveICs, loadActiveICId, saveActiveICId, loadTeamName, saveTeamName } from '../utils/storage';
import {
  calculateTimeOff,
  calculateTotalPTO,
  getProjectWeeks,
  calculateTotalPlanned,
  calculateUtilization,
  calculateStatus
} from '../utils/calculations';

const CapacityContext = createContext(null);

export const useCapacity = () => {
  const context = useContext(CapacityContext);
  if (!context) {
    throw new Error('useCapacity must be used within CapacityProvider');
  }
  return context;
};

const createEmptyIC = () => ({
  id: uuidv4(),
  icName: '',
  icRole: '',
  quarter: '',
  weeksInQuarter: '',
  timeOff: {
    okrTime: { value: '', unit: 'days' },
    devDays: '',
    holidayDays: ''
  },
  ptoInstances: [],
  domains: [],
  lastModified: new Date().toISOString()
});

export const CapacityProvider = ({ children }) => {
  const [ics, setICs] = useState([]);
  const [activeICId, setActiveICIdState] = useState(null);
  const [saveError, setSaveError] = useState(false);
  const [teamName, setTeamNameState] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const loadedICs = loadICs();
    const loadedActiveId = loadActiveICId();

    if (loadedICs.length > 0) {
      setICs(loadedICs);
      setActiveICIdState(loadedActiveId || loadedICs[0].id);
    }

    setTeamNameState(loadTeamName());
  }, []);

  // Save to localStorage whenever ics or activeICId changes (debounced)
  useEffect(() => {
    if (ics.length === 0) return;

    const timeoutId = setTimeout(() => {
      const success = saveICs(ics);
      if (!success) {
        setSaveError(true);
      } else {
        setSaveError(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [ics]);

  useEffect(() => {
    if (activeICId) {
      saveActiveICId(activeICId);
    }
  }, [activeICId]);

  const activeIC = ics.find(ic => ic.id === activeICId) || null;

  const createIC = useCallback(() => {
    const newIC = createEmptyIC();
    setICs(prev => [...prev, newIC]);
    setActiveICIdState(newIC.id);
    return newIC.id;
  }, []);

  const updateIC = useCallback((id, updates) => {
    setICs(prev => prev.map(ic =>
      ic.id === id
        ? { ...ic, ...updates, lastModified: new Date().toISOString() }
        : ic
    ));
  }, []);

  const deleteIC = useCallback((id) => {
    setICs(prev => {
      const filtered = prev.filter(ic => ic.id !== id);

      // If deleting active IC, switch to first remaining IC
      if (id === activeICId && filtered.length > 0) {
        setActiveICIdState(filtered[0].id);
      } else if (filtered.length === 0) {
        setActiveICIdState(null);
      }

      return filtered;
    });
  }, [activeICId]);

  const setActiveIC = useCallback((id) => {
    setActiveICIdState(id);
  }, []);

  const duplicateIC = useCallback((id) => {
    const icToDuplicate = ics.find(ic => ic.id === id);
    if (!icToDuplicate) return;

    const newIC = {
      ...icToDuplicate,
      id: uuidv4(),
      icName: `${icToDuplicate.icName} (Copy)`,
      lastModified: new Date().toISOString()
    };

    setICs(prev => [...prev, newIC]);
    setActiveICIdState(newIC.id);
  }, [ics]);

  const clearIC = useCallback((id) => {
    const emptyData = createEmptyIC();
    updateIC(id, {
      icName: '',
      icRole: '',
      quarter: '',
      weeksInQuarter: '',
      timeOff: emptyData.timeOff,
      domains: []
    });
  }, [updateIC]);

  const updateTeamName = useCallback((name) => {
    setTeamNameState(name);
    saveTeamName(name);
  }, []);

  const reorderICs = useCallback((fromId, toId) => {
    setICs(prev => {
      const from = prev.findIndex(ic => ic.id === fromId);
      const to = prev.findIndex(ic => ic.id === toId);
      if (from === -1 || to === -1 || from === to) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  }, []);

  const importIC = useCallback((icData) => {
    const newIC = {
      ...icData,
      id: uuidv4(),
      lastModified: new Date().toISOString()
    };
    setICs(prev => [...prev, newIC]);
    setActiveICIdState(newIC.id);
  }, []);

  const calculateResults = useCallback((ic) => {
    if (!ic) return null;

    const totalWeeksInQuarter = Number(ic.weeksInQuarter) || 0;

    // Get PTO from scheduled instances
    const ptoWeeks = calculateTotalPTO(ic.ptoInstances || []);

    // Transform timeOff data to match calculateTimeOff expectations
    const timeOffParams = {
      pto: 0, // PTO now comes from scheduled instances
      dev: Number(ic.timeOff.devDays) || 0,
      holiday: Number(ic.timeOff.holidayDays) || 0
    };

    // Add okrWeeks or okrDays based on unit
    if (ic.timeOff.okrTime.unit === 'weeks') {
      timeOffParams.okrWeeks = Number(ic.timeOff.okrTime.value) || 0;
    } else {
      timeOffParams.okrDays = Number(ic.timeOff.okrTime.value) || 0;
    }

    const otherTimeOffWeeks = calculateTimeOff(timeOffParams);
    const totalTimeOffWeeks = otherTimeOffWeeks + ptoWeeks;
    const totalWeeksAvailable = totalWeeksInQuarter - totalTimeOffWeeks;

    const domainEfforts = ic.domains.map(domain => {
      const projects = (domain.projects || []).map(p => ({
        title: p.title,
        weeks: getProjectWeeks(p)
      }));
      const totalWeeks = projects.reduce((sum, p) => sum + p.weeks, 0);
      return {
        domainId: domain.id,
        domainName: domain.name,
        totalWeeks,
        projects
      };
    });

    const effortValues = domainEfforts.map(d => d.totalWeeks);
    const totalPlannedWork = calculateTotalPlanned(effortValues);
    const capacityUtilization = calculateUtilization(totalPlannedWork, totalWeeksAvailable);
    const overUnderCapacity = totalPlannedWork - totalWeeksAvailable;
    const status = calculateStatus(capacityUtilization);

    return {
      totalWeeksInQuarter,
      totalTimeOffWeeks,
      totalWeeksAvailable,
      domainEfforts,
      totalPlannedWork,
      capacityUtilization,
      overUnderCapacity,
      status
    };
  }, []);

  const value = {
    ics,
    activeICId,
    activeIC,
    saveError,
    teamName,
    createIC,
    updateIC,
    deleteIC,
    setActiveIC,
    duplicateIC,
    clearIC,
    importIC,
    updateTeamName,
    reorderICs,
    calculateResults
  };

  return (
    <CapacityContext.Provider value={value}>
      {children}
    </CapacityContext.Provider>
  );
};
