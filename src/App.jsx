import React from 'react';
import { KdsMessage } from 'react-mx-web-components';
import { CapacityProvider, useCapacity } from './context/CapacityContext';
import ICSelector from './components/ICSelector';
import EmptyState from './components/EmptyState';
import GlobalNavBar from './components/GlobalNavBar';
import QuarterInfoForm from './components/QuarterInfoForm';
import ICInfoForm from './components/ICInfoForm';
import TimeOffForm from './components/TimeOffForm';
import DomainList from './components/DomainList';
import CapacityDashboard from './components/CapacityDashboard';
import './App.css';

function AppContent() {
  const { activeIC, saveError } = useCapacity();

  return (
    <div className="app-shell">
      <GlobalNavBar />
      <div className="app-container">
        {saveError && (
          <KdsMessage kind="warning" className="mb-16">
            Auto-save disabled - data won't persist across sessions
          </KdsMessage>
        )}

        <ICSelector />

        {!activeIC ? (
          <EmptyState key="empty" />
        ) : (
          <div key={activeIC.id} className="capacity-layout-grid">
            <div className="forms-column">
              <QuarterInfoForm />
              <ICInfoForm />
              <TimeOffForm />
              <DomainList />
            </div>
            <div className="dashboard-column">
              <CapacityDashboard />
            </div>
          </div>
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
