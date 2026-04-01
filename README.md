# IC Capacity Planning Web App

A React-based web application to help Individual Contributors (ICs) and managers estimate quarterly capacity using a standardized methodology.

## Features

- **Multiple IC Plans:** Create and manage capacity plans for multiple team members
- **Real-time Calculations:** Automatic capacity calculations as you type
- **Visual Dashboard:** Color-coded capacity status with utilization metrics
- **Formatted Output:** Generate methodology-compliant summary text for sharing
- **Local Storage:** Auto-save to browser localStorage (no backend needed)
- **Export/Import:** Export plans as JSON files for backup or sharing

## Getting Started

### Prerequisites

- Node.js 14+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Opens [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

Creates optimized production build in `/build` directory.

### Testing

```bash
npm test
```

Runs calculation utility tests.

## Usage

1. **Create IC:** Click "New IC" to create a new capacity plan
2. **Fill Form:** Enter quarter info, IC details, time off, and planned work by domain
3. **View Dashboard:** See real-time capacity calculations and status
4. **Generate Summary:** Click "View Summary" to see formatted output
5. **Copy & Share:** Use "Copy to Clipboard" to share with stakeholders

## Capacity Calculation Methodology

Based on IC Quarterly Capacity Planning Methodology:

- **Total Time Off:** OKR time + (PTO + Dev + Holiday days) / 5
- **Total Available:** Weeks in quarter - Total time off
- **Domain Effort:** (Small × 2) + (Medium × 4) + (Large × 8) weeks
- **Utilization:** (Total planned / Total available) × 100%
- **Status:**
  - Under capacity: < 90%
  - Fully allocated: 90-100%
  - Over capacity: > 100%

## Tech Stack

- **React** (Create React App)
- **Material-UI v5** for UI components
- **React Context API** for state management
- **localStorage** for persistence
- **uuid** for ID generation

## Project Structure

```
src/
├── components/       # React components
├── context/          # Context providers
├── utils/            # Pure functions (calculations, storage, validation)
├── App.jsx           # Main app layout
└── index.js          # Entry point with theme
```

## License

MIT
