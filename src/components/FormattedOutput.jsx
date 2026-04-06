import React, { useState } from 'react';
import { MxModal, MxModalBody } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';
import { generateSummary } from '../utils/calculations';

const FormattedOutput = ({ open, onClose }) => {
  const { activeIC, calculateResults } = useCapacity();
  const [copySuccess, setCopySuccess] = useState(false);

  if (!activeIC) return null;

  const calculated = calculateResults(activeIC);
  if (!calculated) return null;

  const summary = generateSummary(activeIC, calculated);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <MxModal
      isOpened={open}
      headercontent="Capacity Summary"
      footerPrimaryButtonText={copySuccess ? 'Copied!' : 'Copy to Clipboard'}
      footerSecondaryButtonText="Close"
      closeOnSecondaryButton
      onApplyClick={handleCopy}
      onSecondaryClick={onClose}
      onModalClose={onClose}
    >
      <MxModalBody>
        <pre className="summary-pre">{summary}</pre>
      </MxModalBody>
    </MxModal>
  );
};

export default FormattedOutput;
