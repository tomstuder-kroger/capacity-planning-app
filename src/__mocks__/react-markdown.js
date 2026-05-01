import React from 'react';

const ReactMarkdown = ({ children }) => (
  React.createElement('div', { 'data-testid': 'react-markdown' }, children)
);

export default ReactMarkdown;
