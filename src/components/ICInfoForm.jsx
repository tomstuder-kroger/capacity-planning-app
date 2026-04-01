import React from 'react';
import { Card, CardContent, Typography, TextField, Grid } from '@mui/material';
import { useCapacity } from '../context/CapacityContext';
import { validateICName, validateICRole } from '../utils/validation';

const ICInfoForm = () => {
  const { activeIC, updateIC } = useCapacity();

  if (!activeIC) return null;

  const handleNameChange = (e) => {
    updateIC(activeIC.id, { icName: e.target.value });
  };

  const handleRoleChange = (e) => {
    updateIC(activeIC.id, { icRole: e.target.value });
  };

  const nameError = validateICName(activeIC.icName);
  const roleError = validateICRole(activeIC.icRole);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          IC Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="IC Name"
              placeholder="e.g., Joe Test"
              value={activeIC.icName}
              onChange={handleNameChange}
              error={!!nameError}
              helperText={nameError}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="IC Role"
              placeholder="e.g., PD"
              value={activeIC.icRole}
              onChange={handleRoleChange}
              error={!!roleError}
              helperText={roleError}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ICInfoForm;
