import React from 'react';

const krogerLogo = 'https://www.figma.com/api/mcp/asset/3ca0332f-2dcf-4f1b-8de8-ce683e133277';

const GlobalNavBar = () => {
  return (
    <header style={{
      backgroundColor: '#0F52A2',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img
          src={krogerLogo}
          alt="Kroger"
          style={{ height: '33px', width: '60px', objectFit: 'contain' }}
        />
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '20px',
          fontWeight: 400,
          lineHeight: '24px',
          color: '#ffffff',
          whiteSpace: 'nowrap',
        }}>
          IC Capacity Planning
        </span>
      </div>

    </header>
  );
};

export default GlobalNavBar;
