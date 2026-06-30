import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCapacity } from '../context/CapacityContext';

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

const ICInfoForm = () => {
  const { activeIC, updateIC } = useCapacity();

  if (!activeIC) return null;

  return (
    <div className="kds-Card kds-Card--m kds-card-section">
      <h2 className="kds-Heading kds-Heading--s section-heading">IC Information</h2>
      <div className="form-grid-2col">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ic-name">IC Name</Label>
          <Input
            id="ic-name"
            placeholder="e.g., Joe Test"
            value={activeIC.icName}
            onChange={(e) => updateIC(activeIC.id, { icName: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ic-role">IC Role</Label>
          <Select
            value={activeIC.icRole}
            onValueChange={(value) => updateIC(activeIC.id, { icRole: value })}
          >
            <SelectTrigger id="ic-role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ROLES.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ICInfoForm;
