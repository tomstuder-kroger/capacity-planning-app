import React from 'react';
import { Container, Box, Typography, Grid, Alert } from '@mui/material';
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          IC Capacity Planning
        </Typography>

        {saveError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Auto-save disabled - data won't persist across sessions
          </Alert>
        )}

        <ICSelector />

        {!activeIC ? (
          <Alert severity="info">
            Create your first IC capacity plan by clicking "New IC" above
          </Alert>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <QuarterInfoForm />
              <ICInfoForm />
              <TimeOffForm />
              <DomainList />
            </Grid>
            <Grid item xs={12} md={5}>
              <CapacityDashboard />
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
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
