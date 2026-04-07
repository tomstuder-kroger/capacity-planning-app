import React, { useState, useEffect } from 'react';
import { MxInputTextBox, MxSingleSelect } from 'react-mx-web-components';
import { MxModal, MxModalBody } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';

const CreateMemberModal = ({ isOpen, onClose, onCreated }) => {
  const { createIC, updateIC } = useCapacity();
  const [icName, setIcName] = useState('');
  const [icRole, setIcRole] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIcName('');
      setIcRole('');
    }
  }, [isOpen]);

  const handleCreate = () => {
    if (!icName.trim()) return;
    const newId = createIC();
    updateIC(newId, { icName: icName.trim(), icRole });
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
        />
        <div style={{ marginTop: '1rem' }}>
          <MxSingleSelect
            label="Role"
            items={['APD', 'PD', 'SPD']}
            value={icRole}
            emitOnlyValue
            onValueUpdate={(e) => setIcRole(e.detail)}
          />
        </div>
      </MxModalBody>
    </MxModal>
  );
};

export default CreateMemberModal;
