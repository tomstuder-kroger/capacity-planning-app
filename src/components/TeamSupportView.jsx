import React from 'react';
import { Button } from '@/components/ui/button';
import { useCapacity } from '../context/CapacityContext';
import { getTeamSupportNeeds } from '../utils/supportNeeds';

const TeamSupportView = ({ onBack }) => {
  const { ics } = useCapacity();

  const { userResearch, serviceDesigner } = getTeamSupportNeeds(ics);
  const hasSupport = userResearch.length > 0 || serviceDesigner.length > 0;

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack}>← Back to Capacity Planning</Button>
      </div>

      <div className="p-6 bg-card rounded-lg border">
        <h1 className="text-xl font-bold mb-6">Team Support Needs</h1>

        {!hasSupport ? (
          <div className="text-center py-12 text-muted-foreground">
            No support requests across the team
          </div>
        ) : (
          <>
            {userResearch.length > 0 && (
              <div className="mb-8">
                <h2 className="text-base font-semibold mb-4">User Research</h2>
                <ul className="m-0 pl-5 list-disc">
                  {userResearch.map((item, index) => (
                    <li key={index} className="mb-2 text-sm">
                      <strong>{item.projectTitle}</strong> - {item.icName} ({item.domainName})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {serviceDesigner.length > 0 && (
              <div>
                <h2 className="text-base font-semibold mb-4">Service Designer</h2>
                <ul className="m-0 pl-5 list-disc">
                  {serviceDesigner.map((item, index) => (
                    <li key={index} className="mb-2 text-sm">
                      <strong>{item.projectTitle}</strong> - {item.icName} ({item.domainName})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeamSupportView;
