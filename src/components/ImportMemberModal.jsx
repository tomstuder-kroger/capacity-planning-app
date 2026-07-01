import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCapacity } from '../context/CapacityContext';

const ImportMemberModal = ({ isOpen, onClose, onImported }) => {
  const { importIC } = useCapacity();
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) { setJsonInput(''); setError(''); }
  }, [isOpen]);

  const handleImport = () => {
    try {
      const data = JSON.parse(jsonInput.trim());
      if (!data.icName) { setError('Invalid data: missing icName field'); return; }
      importIC(data);
      onClose();
      if (onImported) onImported();
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Team Member</DialogTitle>
        </DialogHeader>
        <div className="py-2 flex flex-col gap-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <label htmlFor="json-input" className="text-xs font-semibold">
            Paste Team Member JSON
          </label>
          <textarea
            id="json-input"
            value={jsonInput}
            onChange={(e) => { setJsonInput(e.target.value); setError(''); }}
            placeholder='{"icName": "Jane Smith", "icRole": "Product Designer", ...}'
            className="w-full min-h-[200px] p-3 border border-input rounded-md font-mono text-sm resize-y bg-input/10 focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <p className="text-sm text-muted-foreground">
            Paste the complete JSON object for a team member. The data will be imported as a new team member.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleImport} disabled={!jsonInput.trim()}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportMemberModal;
