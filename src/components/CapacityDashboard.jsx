import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  LinearProgress,
  Alert
} from '@mui/material';
import { Visibility, Warning } from '@mui/icons-material';
import { useCapacity } from '../context/CapacityContext';
import FormattedOutput from './FormattedOutput';

const CapacityDashboard = () => {
  const { activeIC, calculateResults } = useCapacity();
  const [summaryOpen, setSummaryOpen] = useState(false);

  if (!activeIC) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary" align="center">
            Create an IC to see capacity dashboard
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const calculated = calculateResults(activeIC);

  if (!calculated) return null;

  const {
    totalWeeksAvailable,
    totalPlannedWork,
    capacityUtilization,
    overUnderCapacity,
    status
  } = calculated;

  const getStatusColor = () => {
    if (status === 'over') return 'error';
    if (status === 'fully') return 'warning';
    return 'success';
  };

  const getStatusLabel = () => {
    if (status === 'over') return 'Over Capacity';
    if (status === 'fully') return 'Fully Allocated';
    return 'Under Capacity';
  };

  const getOverUnderText = () => {
    if (overUnderCapacity > 0) {
      return `Over by ${Math.abs(overUnderCapacity).toFixed(1)}w`;
    } else if (overUnderCapacity < 0) {
      return `Under by ${Math.abs(overUnderCapacity).toFixed(1)}w`;
    }
    return 'Fully allocated';
  };

  const utilizationValue = Math.min(capacityUtilization, 200); // Cap for display
  const showInfinityWarning = !isFinite(capacityUtilization);

  const totalProjects = activeIC.domains.reduce((sum, d) =>
    sum + (Number(d.smallProjects) || 0) + (Number(d.mediumProjects) || 0) + (Number(d.largeProjects) || 0), 0);

  const projectSummary = [];
  const totalSmall = activeIC.domains.reduce((sum, d) => sum + (Number(d.smallProjects) || 0), 0);
  const totalMedium = activeIC.domains.reduce((sum, d) => sum + (Number(d.mediumProjects) || 0), 0);
  const totalLarge = activeIC.domains.reduce((sum, d) => sum + (Number(d.largeProjects) || 0), 0);

  if (totalLarge > 0) projectSummary.push(`${totalLarge} Large`);
  if (totalMedium > 0) projectSummary.push(`${totalMedium} Medium`);
  if (totalSmall > 0) projectSummary.push(`${totalSmall} Small`);

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Capacity Status
          </Typography>

          {showInfinityWarning ? (
            <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
              Cannot calculate utilization - no available time
            </Alert>
          ) : (
            <>
              <Box sx={{ textAlign: 'center', my: 3 }}>
                <Typography variant="h2" color={getStatusColor()}>
                  {capacityUtilization.toFixed(0)}%
                </Typography>
                <Typography variant="h6" color={getStatusColor()} gutterBottom>
                  {getStatusLabel()}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(utilizationValue / 200) * 100}
                  color={getStatusColor()}
                  sx={{ height: 10, borderRadius: 5, my: 2 }}
                />
              </Box>
            </>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Available:
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {totalWeeksAvailable.toFixed(1)}w
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Planned:
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {totalPlannedWork.toFixed(1)}w
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Difference:
              </Typography>
              <Typography variant="body2" fontWeight="bold" color={getStatusColor()}>
                {getOverUnderText()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Chip label={`${activeIC.domains.length} Domain(s)`} size="small" sx={{ mr: 1 }} />
            {totalProjects > 0 && (
              <Chip label={projectSummary.join(', ')} size="small" />
            )}
          </Box>

          <Button
            variant="contained"
            startIcon={<Visibility />}
            onClick={() => setSummaryOpen(true)}
            fullWidth
          >
            View Summary
          </Button>
        </CardContent>
      </Card>

      <FormattedOutput open={summaryOpen} onClose={() => setSummaryOpen(false)} />
    </>
  );
};

export default CapacityDashboard;
