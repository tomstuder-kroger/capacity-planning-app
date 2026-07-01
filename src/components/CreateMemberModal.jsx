import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useCapacity } from '../context/CapacityContext';

const CreateMemberModal = ({ isOpen, onClose, onCreated }) => {
  const { createIC, updateIC } = useCapacity();
  const [icName, setIcName] = useState('');

  useEffect(() => {
    if (isOpen) setIcName('');
  }, [isOpen]);

  const handleCreate = () => {
    if (!icName.trim()) return;
    const newId = createIC();
    updateIC(newId, { icName: icName.trim() });
    onClose();
    onCreated(newId);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && icName.trim()) handleCreate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 py-2">
          <Label htmlFor="create-name">Name</Label>
          <Input
            id="create-name"
            placeholder="e.g., Jane Smith"
            value={icName}
            onChange={(e) => setIcName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <p className="mt-2 text-sm text-muted-foreground">
            You can set their role and other details after creating them.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!icName.trim()}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMemberModal;
