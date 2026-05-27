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
        <div className="support-section-group">
          <div className="support-section-title">
            User Research:
          </div>
          <ul className="support-section-list">
            {userResearch.map(project => (
              <li key={project.id} className="support-section-item">
                {project.title || 'Untitled Project'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {serviceDesigner.length > 0 && (
        <div className="support-section-group">
          <div className="support-section-title">
            Service Designer:
          </div>
          <ul className="support-section-list">
            {serviceDesigner.map(project => (
              <li key={project.id} className="support-section-item">
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
