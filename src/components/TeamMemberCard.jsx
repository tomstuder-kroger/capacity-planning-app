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
        className="kds-Card kds-Card--m kds-card-section team-member-card"
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
          transition: 'opacity 0.2s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isEditMode && (
            <div style={{ color: '#9ca3af', fontSize: '1.1rem', marginRight: '0.5rem', flexShrink: 0, userSelect: 'none', cursor: 'grab' }}>⠿</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
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
                <div className="team-card-name">{ic.icName || 'Unnamed'}</div>
                <div className="team-card-role">{ic.icRole || 'No role set'}</div>
              </>
            )}
          </div>

          {isEditMode ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDeleteClick}
              aria-label="Remove team member"
              style={{ marginLeft: '0.5rem', flexShrink: 0 }}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            </Button>
          ) : hasUtilization && (
            <div style={{ textAlign: 'center', marginLeft: '1rem', flexShrink: 0 }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                fontFamily: 'Nunito, sans-serif',
                lineHeight: 1,
                color: utilization === 0 ? '#9ca3af' : STATUS_COLORS[status] || '#000',
              }}>
                {utilization.toFixed(0)}%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '4px' }}>Capacity</div>
            </div>
          )}
        </div>

        {!isEditMode && ic.domains.length > 0 && (
          <div className="tag-row" style={{ marginTop: '0.75rem' }}>
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
        <DialogContent>
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
