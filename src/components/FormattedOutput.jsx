import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { useCapacity } from '../context/CapacityContext';
import { generateSummary } from '../utils/calculations';

const FormattedOutput = ({ open, onClose }) => {
  const { activeIC, calculateResults } = useCapacity();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  if (!activeIC) return null;

  const calculated = calculateResults(activeIC);
  if (!calculated) return null;

  const summary = generateSummary(activeIC, calculated);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Capacity Summary</DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto'
            }}
          >
            {summary}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button
            variant="contained"
            startIcon={<ContentCopy />}
            onClick={handleCopy}
          >
            Copy to Clipboard
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Summary copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default FormattedOutput;
