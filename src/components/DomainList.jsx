import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Add } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { useCapacity } from '../context/CapacityContext';
import DomainForm from './DomainForm';

const DomainList = () => {
  const { activeIC, updateIC } = useCapacity();

  if (!activeIC) return null;

  const handleAddDomain = () => {
    const newDomain = {
      id: uuidv4(),
      name: '',
      smallProjects: 0,
      mediumProjects: 0,
      largeProjects: 0
    };
    updateIC(activeIC.id, {
      domains: [...activeIC.domains, newDomain]
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Domains & Planned Work
      </Typography>

      {activeIC.domains.length === 0 ? (
        <Paper sx={{ p: 3, mb: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography color="text.secondary">
            No domains added yet. Click "Add Domain" to start.
          </Typography>
        </Paper>
      ) : (
        activeIC.domains.map(domain => (
          <DomainForm key={domain.id} domain={domain} />
        ))
      )}

      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={handleAddDomain}
        fullWidth
      >
        Add Domain
      </Button>
    </Box>
  );
};

export default DomainList;
