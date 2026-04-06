const React = require('react');

const makeComponent = (name) => {
  const Component = ({ children, onClick, onChange, ...props }) =>
    React.createElement('div', { 'data-testid': name, onClick, onChange, ...props }, children);
  Component.displayName = name;
  return Component;
};

module.exports = {
  KdsButton: ({ children, onClick, disabled, ...props }) =>
    React.createElement('button', { onClick, disabled, ...props }, children),
  KdsInput: makeComponent('KdsInput'),
  KdsLabel: makeComponent('KdsLabel'),
  KdsSelect: makeComponent('KdsSelect'),
  KdsRadio: makeComponent('KdsRadio'),
  KdsMessage: makeComponent('KdsMessage'),
  KdsTag: makeComponent('KdsTag'),
  KdsText: makeComponent('KdsText'),
  KdsToastController: makeComponent('KdsToastController'),
  KdsToast: makeComponent('KdsToast'),
  KdsIconEye: makeComponent('KdsIconEye'),
  MxModal: makeComponent('MxModal'),
  MxModalBody: makeComponent('MxModalBody'),
  MxModalHeader: makeComponent('MxModalHeader'),
  MxModalFooter: makeComponent('MxModalFooter'),
};
