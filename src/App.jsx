import React, { useState } from 'react';
import { KdsMessage } from 'react-mx-web-components';
import { CapacityProvider, useCapacity } from './context/CapacityContext';
import GlobalNavBar from './components/GlobalNavBar';
import TeamDashboard from './components/TeamDashboard';
import PlanningView from './components/PlanningView';
import './App.css';

function AppContent() {
  const { activeIC, setActiveIC, saveError } = useCapacity();
  const [currentView, setCurrentView] = useState('team');

  const navigateToPlanning = (icId) => {
    setActiveIC(icId);
    setCurrentView('planning');
  };

  const navigateToTeam = () => {
    setCurrentView('team');
  };

  return (
    <div className="app-shell">
      <GlobalNavBar />
      <div className="app-container">
        {saveError && (
          <KdsMessage kind="warning" className="mb-16">
            Auto-save disabled - data won't persist across sessions
          </KdsMessage>
        )}

        {currentView === 'team' ? (
          <TeamDashboard onSelectMember={navigateToPlanning} />
        ) : (
          <PlanningView key={activeIC?.id} onBack={navigateToTeam} />
        )}
      </div>
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
