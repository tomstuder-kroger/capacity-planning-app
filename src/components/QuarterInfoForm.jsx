import React from 'react';
import { Card, CardContent, Typography, TextField, Grid } from '@mui/material';
import { useCapacity } from '../context/CapacityContext';
import { validateQuarterName, validateWeeksInQuarter } from '../utils/validation';

const QuarterInfoForm = () => {
  const { activeIC, updateIC } = useCapacity();

  if (!activeIC) return null;

  const handleQuarterChange = (e) => {
    updateIC(activeIC.id, { quarter: e.target.value });
  };

  const handleWeeksChange = (e) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    updateIC(activeIC.id, { weeksInQuarter: value });
  };

  const quarterError = validateQuarterName(activeIC.quarter);
  const weeksError = validateWeeksInQuarter(activeIC.weeksInQuarter);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quarter Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quarter"
              placeholder="e.g., Q1 2024"
              value={activeIC.quarter}
              onChange={handleQuarterChange}
              error={!!quarterError}
              helperText={quarterError}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Weeks in Quarter"
              type="number"
              placeholder="e.g., 13"
              value={activeIC.weeksInQuarter}
              onChange={handleWeeksChange}
              error={!!weeksError}
              helperText={weeksError}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuarterInfoForm;
