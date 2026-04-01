import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useCapacity } from '../context/CapacityContext';
import { validateDomainName, validateNonNegativeInteger } from '../utils/validation';
import { calculateDomainEffort } from '../utils/calculations';

const DomainForm = ({ domain }) => {
  const { activeIC, updateIC } = useCapacity();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!activeIC) return null;

  const handleDomainChange = (field, value) => {
    // For numeric fields, convert to number but keep empty string as 0
    let processedValue = value;
    if (['smallProjects', 'mediumProjects', 'largeProjects'].includes(field)) {
      processedValue = value === '' ? 0 : Number(value);
    }

    const updatedDomains = activeIC.domains.map(d =>
      d.id === domain.id ? { ...d, [field]: processedValue } : d
    );
    updateIC(activeIC.id, { domains: updatedDomains });
  };

  const handleRemove = () => {
    setDeleteDialogOpen(true);
  };

  const handleRemoveConfirm = () => {
    const updatedDomains = activeIC.domains.filter(d => d.id !== domain.id);
    updateIC(activeIC.id, { domains: updatedDomains });
    setDeleteDialogOpen(false);
  };

  const handleRemoveCancel = () => {
    setDeleteDialogOpen(false);
  };

  const nameError = validateDomainName(domain.name);
  const smallError = validateNonNegativeInteger(domain.smallProjects);
  const mediumError = validateNonNegativeInteger(domain.mediumProjects);
  const largeError = validateNonNegativeInteger(domain.largeProjects);

  const totalWeeks = calculateDomainEffort({
    small: domain.smallProjects,
    medium: domain.mediumProjects,
    large: domain.largeProjects
  });

  return (
    <>
      <Card sx={{ mb: 2, position: 'relative' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Domain
            </Typography>
            <IconButton color="error" onClick={handleRemove} size="small">
              <Delete />
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Domain Name"
                placeholder="e.g., TEST"
                value={domain.name}
                onChange={(e) => handleDomainChange('name', e.target.value)}
                error={!!nameError}
                helperText={nameError}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Small Projects (2w ea)"
                type="number"
                value={domain.smallProjects}
                onChange={(e) => handleDomainChange('smallProjects', e.target.value)}
                error={!!smallError}
                helperText={smallError}
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Medium Projects (4w ea)"
                type="number"
                value={domain.mediumProjects}
                onChange={(e) => handleDomainChange('mediumProjects', e.target.value)}
                error={!!mediumError}
                helperText={mediumError}
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Large Projects (8w ea)"
                type="number"
                value={domain.largeProjects}
                onChange={(e) => handleDomainChange('largeProjects', e.target.value)}
                error={!!largeError}
                helperText={largeError}
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Domain total: <strong>{totalWeeks.toFixed(1)} weeks</strong>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onClose={handleRemoveCancel}>
        <DialogTitle>Remove Domain</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Remove domain "{domain.name || 'Untitled'}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemoveCancel}>Cancel</Button>
          <Button onClick={handleRemoveConfirm} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DomainForm;
