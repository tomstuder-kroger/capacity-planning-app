import React, { useState, useEffect } from 'react';
import { MxInputTextBox } from 'react-mx-web-components';
import { MxModal, MxModalBody } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';

const CreateMemberModal = ({ isOpen, onClose, onCreated }) => {
  const { createIC, updateIC } = useCapacity();
  const [icName, setIcName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIcName('');
    }
  }, [isOpen]);

  const handleCreate = () => {
    if (!icName.trim()) return;
    const newId = createIC();
    updateIC(newId, { icName: icName.trim() });
    onClose();
    onCreated(newId);
  };

  return (
    <MxModal
      isOpened={isOpen}
      headercontent="Add Team Member"
      footerPrimaryButtonText="Create"
      footerPrimaryButtonDisabled={!icName.trim()}
      footerSecondaryButtonText="Cancel"
      closeOnSecondaryButton
      onApplyClick={handleCreate}
      onSecondaryClick={onClose}
      onModalClose={onClose}
    >
      <MxModalBody>
        <MxInputTextBox
          label="Name"
          placeholder="e.g., Jane Smith"
          value={icName}
          onChange={(e) => setIcName(e.target.value)}
          mask="none"
          isClearable={false}
          autoFocus
        />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          You can set their role and other details after creating them.
        </p>
      </MxModalBody>
    </MxModal>
  );
};

export default CreateMemberModal;
