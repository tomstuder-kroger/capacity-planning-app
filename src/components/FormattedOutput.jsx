import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
      const html = marked(summary);
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([summary], { type: 'text/plain' });

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      try {
        await navigator.clipboard.writeText(summary);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      } catch (fallbackError) {
        console.error('Copy failed:', fallbackError);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Capacity Summary</DialogTitle>
        </DialogHeader>
        <div className="summary-markdown overflow-y-auto flex-1">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleCopy}>{copySuccess ? 'Copied!' : 'Copy to Clipboard'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormattedOutput;
