import React from 'react';
import { useCapacity } from '../context/CapacityContext';
import { getSupportNeedsByType } from '../utils/supportNeeds';

const SupportNeedsDashboard = () => {
  const { activeIC } = useCapacity();

  if (!activeIC) return null;

  const { userResearch, serviceDesigner } = getSupportNeedsByType(activeIC);

  // Hide section entirely if no support needs
  if (userResearch.length === 0 && serviceDesigner.length === 0) {
    return null;
  }

  return (
    <div className="kds-Card kds-Card--m kds-card-section">
      <h2 className="kds-Heading kds-Heading--s section-heading">Support Needed</h2>

      {userResearch.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '14px' }}>
            User Research:
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc' }}>
            {userResearch.map(project => (
              <li key={project.id} style={{ marginBottom: '0.25rem', fontSize: '14px' }}>
                {project.title || 'Untitled Project'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {serviceDesigner.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '14px' }}>
            Service Designer:
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc' }}>
            {serviceDesigner.map(project => (
              <li key={project.id} style={{ marginBottom: '0.25rem', fontSize: '14px' }}>
                {project.title || 'Untitled Project'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SupportNeedsDashboard;
