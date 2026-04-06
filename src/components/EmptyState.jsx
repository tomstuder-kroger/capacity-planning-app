import React from 'react';
import { KdsAccentIconAddToList } from 'react-mx-web-components';

const EmptyState = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '48px 24px',
    }}>
      <KdsAccentIconAddToList size="l" />
      <p style={{
        fontFamily: 'Nunito, sans-serif',
        fontSize: '20px',
        fontWeight: 400,
        lineHeight: '24px',
        color: '#000000',
        textAlign: 'center',
        margin: 0,
      }}>
        No IC plans yet
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
        Create your first IC capacity plan by clicking "New IC" above
      </p>
    </div>
  );
};

export default EmptyState;
