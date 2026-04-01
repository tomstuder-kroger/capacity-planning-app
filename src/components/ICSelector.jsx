import React, { useState } from 'react';
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Paper,
  Typography
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useCapacity } from '../context/CapacityContext';

const ICSelector = () => {
  const {
    ics,
    activeICId,
    activeIC,
    createIC,
    deleteIC,
    setActiveIC,
    duplicateIC
  } = useCapacity();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleCreateIC = () => {
    createIC();
  };

  const handleDuplicateIC = () => {
    if (activeICId) {
      duplicateIC(activeICId);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (activeICId) {
      deleteIC(activeICId);
    }
    setDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleICChange = (event) => {
    setActiveIC(event.target.value);
  };

  const getICDisplayName = (ic) => {
    if (ic.icName && ic.quarter) {
      return `${ic.icName} - ${ic.quarter}`;
    } else if (ic.icName) {
      return ic.icName;
    } else if (ic.quarter) {
      return `Untitled - ${ic.quarter}`;
    } else {
      return 'Untitled IC';
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateIC}
        >
          New IC
        </Button>

        {ics.length > 0 && (
          <>
            <FormControl sx={{ minWidth: 300, flex: 1 }}>
              <InputLabel id="ic-select-label">Select IC</InputLabel>
              <Select
                labelId="ic-select-label"
                id="ic-select"
                value={activeICId || ''}
                label="Select IC"
                onChange={handleICChange}
              >
                {ics.map((ic) => (
                  <MenuItem key={ic.id} value={ic.id}>
                    {getICDisplayName(ic)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <IconButton
              color="primary"
              onClick={handleDuplicateIC}
              title="Duplicate IC"
              disabled={!activeIC}
            >
              <ContentCopyIcon />
            </IconButton>

            <IconButton
              color="error"
              onClick={handleDeleteClick}
              title="Delete IC"
              disabled={!activeIC}
            >
              <DeleteIcon />
            </IconButton>
          </>
        )}

        {ics.length === 0 && (
          <Typography variant="body1" color="text.secondary">
            No ICs yet. Click "New IC" to get started.
          </Typography>
        )}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete IC?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{activeIC ? getICDisplayName(activeIC) : 'this IC'}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ICSelector;
