import React from 'react';

const krogerLogo = '/kroger-logo.svg';

const GlobalNavBar = ({ onNavigateToTeamSupport }) => {
  return (
    <header style={{
      backgroundColor: '#0F52A2',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
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
          PD Capacity Planner
        </span>
      </div>

      {/* Right side */}
      {onNavigateToTeamSupport && (
        <button
          onClick={onNavigateToTeamSupport}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Shared Services Support
        </button>
      )}
    </header>
  );
};

export default GlobalNavBar;
