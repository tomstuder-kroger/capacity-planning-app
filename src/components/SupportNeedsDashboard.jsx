import React from 'react';
import { useCapacity } from '../context/CapacityContext';
import { getSupportNeedsByType } from '../utils/supportNeeds';

const SupportNeedsDashboard = () => {
  const { activeIC } = useCapacity();

  if (!activeIC) return null;

  const { userResearch, serviceDesigner } = getSupportNeedsByType(activeIC);

  if (userResearch.length === 0 && serviceDesigner.length === 0) return null;

  return (
    <div className="mb-4 p-6 bg-card rounded-lg border">
      <h2 className="mb-4 text-base font-bold">Support Needed</h2>

      {userResearch.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-bold mb-2">User Research:</div>
          <ul className="m-0 pl-5 list-disc">
            {userResearch.map(project => (
              <li key={project.id} className="mb-1 text-sm">
                {project.title || 'Untitled Project'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {serviceDesigner.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-bold mb-2">Service Designer:</div>
          <ul className="m-0 pl-5 list-disc">
            {serviceDesigner.map(project => (
              <li key={project.id} className="mb-1 text-sm">
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
