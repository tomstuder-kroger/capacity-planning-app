import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';
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
      // Convert markdown to HTML
      const html = marked(summary);

      // Create a blob for HTML
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([summary], { type: 'text/plain' });

      // Copy both formats to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback to plain text if clipboard.write fails
      try {
        await navigator.clipboard.writeText(summary);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
      }
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
        <div className="summary-markdown">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      </MxModalBody>
    </MxModal>
  );
};

export default FormattedOutput;
