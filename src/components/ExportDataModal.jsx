import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCapacity } from '../context/CapacityContext';
import { exportICAsJSON, exportAllICsAsJSON } from '../utils/storage';

const ALL_MEMBERS_VALUE = '__all__';

const ExportDataModal = ({ isOpen, onClose }) => {
  const { ics } = useCapacity();
  const [selectedId, setSelectedId] = useState(ALL_MEMBERS_VALUE);

  useEffect(() => {
    if (isOpen) {
      setSelectedId(ALL_MEMBERS_VALUE);
    }
  }, [isOpen]);

  const handleExport = () => {
    if (selectedId === ALL_MEMBERS_VALUE) {
      exportAllICsAsJSON(ics);
    } else {
      const ic = ics.find((item) => item.id === selectedId);
      if (ic) exportICAsJSON(ic);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Export all team members or a single team member as JSON
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="export-selection">Export</Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger id="export-selection">
              <SelectValue placeholder="Select what to export" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ALL_MEMBERS_VALUE}>All team members</SelectItem>
                {ics.map((ic) => (
                  <SelectItem key={ic.id} value={ic.id}>{ic.icName || 'Untitled'}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport} disabled={ics.length === 0}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDataModal;
