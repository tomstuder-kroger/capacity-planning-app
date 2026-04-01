import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Box
} from '@mui/material';
import { useCapacity } from '../context/CapacityContext';
import { validateNonNegativeNumber } from '../utils/validation';

const TimeOffForm = () => {
  const { activeIC, updateIC, calculateResults } = useCapacity();

  if (!activeIC) return null;

  const handleOKRValueChange = (e) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    updateIC(activeIC.id, {
      timeOff: {
        ...activeIC.timeOff,
        okrTime: { ...activeIC.timeOff.okrTime, value }
      }
    });
  };

  const handleOKRUnitChange = (e) => {
    updateIC(activeIC.id, {
      timeOff: {
        ...activeIC.timeOff,
        okrTime: { ...activeIC.timeOff.okrTime, unit: e.target.value }
      }
    });
  };

  const handlePTOChange = (e) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    updateIC(activeIC.id, {
      timeOff: { ...activeIC.timeOff, ptoDays: value }
    });
  };

  const handleDevChange = (e) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    updateIC(activeIC.id, {
      timeOff: { ...activeIC.timeOff, devDays: value }
    });
  };

  const handleHolidayChange = (e) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    updateIC(activeIC.id, {
      timeOff: { ...activeIC.timeOff, holidayDays: value }
    });
  };

  const okrError = validateNonNegativeNumber(activeIC.timeOff.okrTime.value);
  const ptoError = validateNonNegativeNumber(activeIC.timeOff.ptoDays);
  const devError = validateNonNegativeNumber(activeIC.timeOff.devDays);
  const holidayError = validateNonNegativeNumber(activeIC.timeOff.holidayDays);

  const calculated = calculateResults(activeIC);
  const totalTimeOff = calculated ? calculated.totalTimeOffWeeks.toFixed(1) : '0.0';

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Time Off
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormLabel component="legend">OKR Time</FormLabel>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                sx={{ flex: 1 }}
                type="number"
                value={activeIC.timeOff.okrTime.value}
                onChange={handleOKRValueChange}
                error={!!okrError}
                helperText={okrError}
                inputProps={{ min: 0, step: 0.1 }}
              />
              <RadioGroup
                row
                value={activeIC.timeOff.okrTime.unit}
                onChange={handleOKRUnitChange}
              >
                <FormControlLabel value="days" control={<Radio />} label="Days" />
                <FormControlLabel value="weeks" control={<Radio />} label="Weeks" />
              </RadioGroup>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="PTO Days"
              type="number"
              value={activeIC.timeOff.ptoDays}
              onChange={handlePTOChange}
              error={!!ptoError}
              helperText={ptoError}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Dev / L&D Days"
              type="number"
              value={activeIC.timeOff.devDays}
              onChange={handleDevChange}
              error={!!devError}
              helperText={devError}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Holiday Days"
              type="number"
              value={activeIC.timeOff.holidayDays}
              onChange={handleHolidayChange}
              error={!!holidayError}
              helperText={holidayError}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total time off: <strong>{totalTimeOff} weeks</strong>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TimeOffForm;
