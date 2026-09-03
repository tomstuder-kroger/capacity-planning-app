import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCapacity } from '../context/CapacityContext';

const BulkImportModal = ({ isOpen, onClose, onImported }) => {
  const { importIC } = useCapacity();
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importMode, setImportMode] = useState('append'); // 'append' or 'replace'
  // Synchronous guard against double-fire (e.g. a fast double-click before
  // React re-renders the disabled button) causing the same import to run
  // twice and create duplicate records sharing one timestamp.
  const isImportingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setJsonInput('');
      setError('');
      setSuccess('');
      isImportingRef.current = false;
    }
  }, [isOpen]);

  const handleImport = () => {
    if (isImportingRef.current) return;
    isImportingRef.current = true;

    try {
      setError('');
      setSuccess('');

      const data = JSON.parse(jsonInput.trim());

      // Check if this is a full localStorage backup
      if (data['capacity-planning-ics']) {
        handleFullBackupImport(data);
      }
      // Check if this is an array of ICs
      else if (Array.isArray(data)) {
        handleArrayImport(data);
      }
      // Check if this is a single IC object
      else if (data.icName) {
        importIC(data);
        setSuccess('Successfully imported 1 team member');
        setTimeout(() => {
          onClose();
          if (onImported) onImported();
        }, 1500);
      } else {
        setError('Invalid data format. Please provide a valid IC object, array of ICs, or full backup.');
        isImportingRef.current = false;
      }
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      isImportingRef.current = false;
    }
  };

  const handleFullBackupImport = (data) => {
    const icsData = data['capacity-planning-ics'];
    const teamName = data['capacity-planning-team-name'];
    const activeId = data['capacity-planning-active-id'];

    if (!Array.isArray(icsData)) {
      setError('Invalid backup format: capacity-planning-ics must be an array');
      return;
    }

    if (importMode === 'replace') {
      // Replace all data
      localStorage.setItem('capacity-planning-ics', JSON.stringify(icsData));
      if (teamName) localStorage.setItem('capacity-planning-team-name', teamName);
      if (activeId) localStorage.setItem('capacity-planning-active-id', activeId);

      setSuccess(`Successfully replaced all data with ${icsData.length} team members. Reloading...`);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      // Append mode
      icsData.forEach(ic => importIC(ic));
      setSuccess(`Successfully imported ${icsData.length} team members`);
      setTimeout(() => {
        onClose();
        if (onImported) onImported();
      }, 1500);
    }
  };

  const handleArrayImport = (icsArray) => {
    let imported = 0;
    let failed = 0;

    icsArray.forEach((ic, index) => {
      if (ic.icName && ic.quarter && ic.weeksInQuarter) {
        importIC(ic);
        imported++;
      } else {
        failed++;
        console.warn(`Skipped invalid IC at index ${index}:`, ic);
      }
    });

    if (failed > 0) {
      setSuccess(`Imported ${imported} team members. ${failed} failed validation.`);
    } else {
      setSuccess(`Successfully imported ${imported} team members`);
    }

    setTimeout(() => {
      onClose();
      if (onImported) onImported();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Team Members</DialogTitle>
          <DialogDescription>
            Add a single or multiple team members, or restore from a backup
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="json" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json">Paste JSON</TabsTrigger>
            <TabsTrigger value="help">Format Help</TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Import Mode:</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={(e) => setImportMode(e.target.value)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm">Append (add to existing)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={(e) => setImportMode(e.target.value)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm text-red-600">Replace (delete all existing)</span>
                  </label>
                </div>
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                placeholder='Paste JSON here...'
                className="w-full min-h-[400px] p-3 border border-input rounded-md font-mono text-xs resize-y bg-input/10 focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </TabsContent>

          <TabsContent value="help" className="space-y-4">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Supported Formats:</h4>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong>Single IC:</strong> One team member object</li>
                  <li><strong>Array of ICs:</strong> Multiple team member objects in an array</li>
                  <li><strong>Full Backup:</strong> Complete localStorage backup with all data</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Example: Single IC</h4>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`{
  "icName": "John Doe",
  "icRole": "Product Designer",
  "quarter": "Q2 2026",
  "weeksInQuarter": 12,
  "timeOff": {
    "okrTime": { "value": 2, "unit": "days" },
    "devDays": 1,
    "holidayDays": 1
  },
  "ptoInstances": [],
  "domains": []
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Example: Array of ICs</h4>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`[
  { "icName": "Person 1", ... },
  { "icName": "Person 2", ... }
]`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Example: Full Backup</h4>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`{
  "capacity-planning-ics": [...],
  "capacity-planning-team-name": "Team Name",
  "capacity-planning-active-id": "..."
}`}
                </pre>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-yellow-800 text-xs">
                  <strong>⚠️ Warning:</strong> Using "Replace" mode will delete all existing team members and replace with the imported data. This action cannot be undone.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleImport} disabled={!jsonInput.trim() || !!success}>
            {success ? '✓ Imported' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;
