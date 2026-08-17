import React from 'react';

const krogerLogo = '/kroger-logo.svg';

const GlobalNavBar = ({ onNavigateToTeamSupport }) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-14 px-6 w-full bg-primary shrink-0">
      <div className="flex items-center gap-4">
        <img src={krogerLogo} alt="Kroger" className="h-[33px] w-[60px] object-contain" />
        <span className="font-sans text-xl font-normal leading-6 text-white whitespace-nowrap">
          PD Capacity Planner
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onNavigateToTeamSupport && (
          <button
            onClick={onNavigateToTeamSupport}
            className="bg-transparent border-none text-white text-base font-semibold cursor-pointer px-4 py-2 rounded hover:bg-white/10 transition-colors"
          >
            Shared Services Support
          </button>
        )}
      </div>
    </header>
  );
};

export default GlobalNavBar;
