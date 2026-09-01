import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CapacityProvider, useCapacity } from '../context/CapacityContext';
import BulkImportModal from './BulkImportModal';

const sampleIC = (name) => ({
  icName: name,
  icRole: 'Product Designer',
  quarter: 'Q3 2026',
  weeksInQuarter: 12,
  timeOff: { okrTime: { value: 0, unit: 'days' }, devDays: 0, holidayDays: 0 },
  ptoInstances: [],
  domains: []
});

let latestContext = null;
const ContextSpy = () => {
  latestContext = useCapacity();
  return null;
};

const Harness = ({ isOpen }) => (
  <CapacityProvider>
    <ContextSpy />
    <BulkImportModal isOpen={isOpen} onClose={() => {}} />
  </CapacityProvider>
);

const pasteAndImport = (json) => {
  const textarea = screen.getByPlaceholderText('Paste JSON here...');
  fireEvent.change(textarea, { target: { value: json } });
  fireEvent.click(screen.getByRole('button', { name: 'Import' }));
};

beforeEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    // localStorage unavailable in this test environment; each test uses a fresh provider anyway
  }
  latestContext = null;
});

test('re-importing an exported array (Append mode, the default) does not duplicate team members', async () => {
  render(<Harness isOpen={true} />);

  latestContext.importIC(sampleIC('Jane Smith'));
  latestContext.importIC(sampleIC('Alex Doe'));
  await waitFor(() => expect(latestContext.ics).toHaveLength(2));

  const exportedArray = JSON.stringify(latestContext.ics);
  pasteAndImport(exportedArray);

  await waitFor(() => expect(screen.getByText(/Successfully imported/i)).toBeInTheDocument());
  expect(latestContext.ics).toHaveLength(2);
  expect(latestContext.ics.map(ic => ic.icName).sort()).toEqual(['Alex Doe', 'Jane Smith']);
});

test('re-importing an exported single IC object does not duplicate it', async () => {
  render(<Harness isOpen={true} />);

  latestContext.importIC(sampleIC('Jane Smith'));
  await waitFor(() => expect(latestContext.ics).toHaveLength(1));

  const exportedSingle = JSON.stringify(latestContext.ics[0]);
  pasteAndImport(exportedSingle);

  await waitFor(() => expect(screen.getByText(/Successfully imported/i)).toBeInTheDocument());
  expect(latestContext.ics).toHaveLength(1);
});

test('re-importing a full localStorage backup in Append mode does not duplicate team members', async () => {
  render(<Harness isOpen={true} />);

  latestContext.importIC(sampleIC('Jane Smith'));
  latestContext.importIC(sampleIC('Alex Doe'));
  await waitFor(() => expect(latestContext.ics).toHaveLength(2));

  const fullBackup = JSON.stringify({
    'capacity-planning-ics': latestContext.ics,
    'capacity-planning-team-name': 'Design Team',
    'capacity-planning-active-id': latestContext.ics[0].id
  });
  pasteAndImport(fullBackup);

  await waitFor(() => expect(screen.getByText(/Successfully imported/i)).toBeInTheDocument());
  expect(latestContext.ics).toHaveLength(2);
});

test('importing a genuinely new team member still adds it', async () => {
  render(<Harness isOpen={true} />);

  latestContext.importIC(sampleIC('Jane Smith'));
  await waitFor(() => expect(latestContext.ics).toHaveLength(1));

  pasteAndImport(JSON.stringify(sampleIC('New Hire')));

  await waitFor(() => expect(latestContext.ics).toHaveLength(2));
});
