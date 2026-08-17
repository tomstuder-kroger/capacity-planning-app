import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CapacityProvider, useCapacity } from './context/CapacityContext';
import GlobalNavBar from './components/GlobalNavBar';
import TeamDashboard from './components/TeamDashboard';
import PlanningView from './components/PlanningView';
import TeamSupportView from './components/TeamSupportView';
import './App.css';

function AppContent() {
  const { activeIC, setActiveIC, saveError } = useCapacity();
  const [currentView, setCurrentView] = useState('team');

  const navigateToPlanning = (icId) => {
    setActiveIC(icId);
    setCurrentView('planning');
  };

  const navigateToTeam = () => setCurrentView('team');
  const navigateToTeamSupport = () => setCurrentView('teamSupport');

  return (
    <div className="min-h-screen bg-muted">
      <GlobalNavBar
        onNavigateToTeamSupport={navigateToTeamSupport}
      />
      {saveError && (
        <div className="max-w-[1800px] mx-auto px-6 pt-4">
          <Alert className="border-warning/30 bg-warning/10 text-warning-foreground">
            <AlertDescription>Auto-save disabled - data won't persist across sessions</AlertDescription>
          </Alert>
        </div>
      )}
      {currentView === 'team' ? (
        <TeamDashboard onSelectMember={navigateToPlanning} />
      ) : (
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          {currentView === 'teamSupport' ? (
            <TeamSupportView onBack={navigateToTeam} />
          ) : (
            <PlanningView key={activeIC?.id} onBack={navigateToTeam} />
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <CapacityProvider>
      <AppContent />
    </CapacityProvider>
  );
}

export default App;
