import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AddToListIcon } from '@hugeicons/core-free-icons';

const EmptyState = ({
  title = 'No IC plans yet',
  subtitle = 'Create your first IC capacity plan by clicking "New IC" above',
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '48px 24px',
    }}>
      <HugeiconsIcon icon={AddToListIcon} strokeWidth={2} size={48} />
      <p style={{
        fontFamily: 'Nunito, sans-serif',
        fontSize: '20px',
        fontWeight: 400,
        lineHeight: '24px',
        color: '#000000',
        textAlign: 'center',
        margin: 0,
      }}>
        {title}
      </p>
      <p style={{
        fontFamily: 'Roboto, sans-serif',
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        color: '#000000',
        textAlign: 'center',
        margin: 0,
      }}>
        {subtitle}
      </p>
    </div>
  );
};

export default EmptyState;
