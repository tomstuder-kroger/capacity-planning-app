import React, { useState, useEffect } from 'react';
import { MxModal, MxModalBody, KdsMessage } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';

const ImportMemberModal = ({ isOpen, onClose, onImported }) => {
  const { importIC } = useCapacity();
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setJsonInput('');
      setError('');
    }
  }, [isOpen]);

  const handleImport = () => {
    try {
      const data = JSON.parse(jsonInput.trim());

      // Basic validation
      if (!data.icName) {
        setError('Invalid data: missing icName field');
        return;
      }

      // Import the data
      importIC(data);
      onClose();
      if (onImported) {
        onImported();
      }
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  return (
    <MxModal
      isOpened={isOpen}
      headercontent="Import Team Member"
      footerPrimaryButtonText="Import"
      footerPrimaryButtonDisabled={!jsonInput.trim()}
      footerSecondaryButtonText="Cancel"
      closeOnSecondaryButton
      onApplyClick={handleImport}
      onSecondaryClick={onClose}
      onModalClose={onClose}
    >
      <MxModalBody>
        {error && (
          <KdsMessage kind="error" style={{ marginBottom: '1rem' }}>
            {error}
          </KdsMessage>
        )}
        <label htmlFor="json-input" className="kds-Label" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Paste Team Member JSON
        </label>
        <textarea
          id="json-input"
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setError('');
          }}
          placeholder='{"icName": "Jane Smith", "icRole": "Product Designer", ...}'
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '0.875rem',
            resize: 'vertical'
          }}
        />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Paste the complete JSON object for a team member. The data will be imported as a new team member.
        </p>
      </MxModalBody>
    </MxModal>
  );
};

export default ImportMemberModal;
