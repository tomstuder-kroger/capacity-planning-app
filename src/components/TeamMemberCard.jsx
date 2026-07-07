import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { useCapacity } from '../context/CapacityContext';

const STATUS_COLORS = {
  under: '#1a7f3c',
  fully: '#1a7f3c',
  over:  '#c0392b',
};

const ROLES = [
  'Associate Product Designer',
  'Product Designer',
  'Senior Product Designer',
  'User Researcher',
  'Senior User Researcher',
  'Service Designer',
  'Senior Service Designer',
  'Journey Architect',
];

const TeamMemberCard = ({ ic, onSelect, isEditMode, isDragging, isDragOver, onDragStart, onDragOver, onDrop, onDragEnd }) => {
  const { deleteIC, updateIC, calculateResults } = useCapacity();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const calculated = calculateResults(ic);
  const utilization = calculated?.capacityUtilization;
  const status = calculated?.status;
  const hasUtilization = typeof utilization === 'number' && isFinite(utilization);

  const totalProjects = ic.domains.reduce((sum, d) => sum + (d.projects ? d.projects.length : 0), 0);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteIC(ic.id);
    setDeleteDialogOpen(false);
  };

  const statusBadgeClass = status !== 'over'
    ? 'bg-success/15 text-success border-success/20 hover:bg-success/20'
    : '';

  return (
    <>
      <div
        className="mb-4 p-6 bg-card rounded-lg border cursor-pointer transition-shadow hover:shadow-md"
        onClick={!isEditMode ? onSelect : undefined}
        draggable={isEditMode}
        onDragStart={onDragStart}
        onDragOver={(e) => { e.preventDefault(); onDragOver?.(); }}
        onDrop={(e) => { e.preventDefault(); onDrop?.(); }}
        onDragEnd={onDragEnd}
        style={{
          cursor: isEditMode ? 'grab' : 'pointer',
          opacity: isDragging ? 0.4 : 1,
          outline: isDragOver ? '2px dashed #0F52A2' : 'none',
          transition: 'opacity 0.2s, box-shadow 0.2s',
        }}
      >
        <div className="flex justify-between items-center">
          {isEditMode && (
            <div className="text-muted-foreground text-lg mr-2 shrink-0 select-none cursor-grab">⠿</div>
          )}
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={ic.icName}
                  onChange={(e) => updateIC(ic.id, { icName: e.target.value })}
                  placeholder="Name"
                />
                <Select
                  value={ic.icRole || ''}
                  onValueChange={(value) => updateIC(ic.id, { icRole: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="font-sans text-base font-semibold text-foreground mb-1">{ic.icName || 'Unnamed'}</div>
                <div className="text-sm text-muted-foreground">{ic.icRole || 'No role set'}</div>
              </>
            )}
          </div>

          {isEditMode ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2 shrink-0"
              onClick={handleDeleteClick}
              aria-label="Remove team member"
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            </Button>
          ) : hasUtilization && (
            <div className="text-center ml-4 shrink-0">
              <div
                className="text-3xl font-bold font-sans leading-none"
                style={{ color: utilization === 0 ? '#9ca3af' : STATUS_COLORS[status] || '#000' }}
              >
                {utilization.toFixed(0)}%
              </div>
              <div className="text-[0.7rem] text-muted-foreground mt-1">Capacity</div>
            </div>
          )}
        </div>

        {!isEditMode && ic.domains.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge
              variant={status === 'over' ? 'destructive' : 'default'}
              className={statusBadgeClass}
            >
              {ic.domains.length} Domain(s)
            </Badge>
            {totalProjects > 0 && (
              <Badge variant="secondary">{totalProjects} Project(s)</Badge>
            )}
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && setDeleteDialogOpen(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
          </DialogHeader>
          <p>Remove "{ic.icName || 'Unnamed'}" from your team? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TeamMemberCard;
