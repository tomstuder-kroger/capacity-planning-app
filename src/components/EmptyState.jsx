import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AddToListIcon } from '@hugeicons/core-free-icons';

const EmptyState = ({
  title = 'No IC plans yet',
  subtitle = 'Create your first IC capacity plan by clicking "New IC" above',
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-1 py-4 px-6 text-center">
        <p className="text-sm font-medium m-0">{title}</p>
        <p className="text-xs font-normal text-muted-foreground m-0">{subtitle}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-12 px-6">
      <HugeiconsIcon icon={AddToListIcon} strokeWidth={2} size={48} />
      <p className="font-sans text-xl font-normal text-center m-0">{title}</p>
      <p className="text-sm font-normal text-center m-0">{subtitle}</p>
    </div>
  );
};

export default EmptyState;
