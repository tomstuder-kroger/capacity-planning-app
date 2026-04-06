import React from 'react';
import { KdsMessage } from 'react-mx-web-components';
import { CapacityProvider, useCapacity } from './context/CapacityContext';
import ICSelector from './components/ICSelector';
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
      <div className="app-container">
        <h1 className="kds-Heading kds-Heading--xl app-title">IC Capacity Planning</h1>

        {saveError && (
          <KdsMessage kind="warning" className="mb-16">
            Auto-save disabled - data won't persist across sessions
          </KdsMessage>
        )}

        <ICSelector />

        {!activeIC ? (
          <KdsMessage kind="info">
            Create your first IC capacity plan by clicking "New IC" above
          </KdsMessage>
        ) : (
          <div className="capacity-layout-grid">
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
