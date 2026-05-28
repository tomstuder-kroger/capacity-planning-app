import React from 'react';
import { KdsButton } from 'react-mx-web-components';
import { useCapacity } from '../context/CapacityContext';
import { getTeamSupportNeeds } from '../utils/supportNeeds';

const TeamSupportView = ({ onBack }) => {
  const { ics } = useCapacity();

  const { userResearch, serviceDesigner } = getTeamSupportNeeds(ics);

  const hasSupport = userResearch.length > 0 || serviceDesigner.length > 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <KdsButton kind="secondary" onClick={onBack}>
          ← Back to Capacity Planning
        </KdsButton>
      </div>

      <div className="kds-Card kds-Card--m" style={{ padding: '24px' }}>
        <h1 className="kds-Heading kds-Heading--l" style={{ marginBottom: '24px' }}>
          Team Support Needs
        </h1>

        {!hasSupport ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
            No support requests across the team
          </div>
        ) : (
          <>
            {userResearch.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 className="kds-Heading kds-Heading--m" style={{ marginBottom: '16px' }}>
                  User Research
                </h2>
                <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc' }}>
                  {userResearch.map((item, index) => (
                    <li key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
                      <strong>{item.projectTitle}</strong> - {item.icName} ({item.domainName})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {serviceDesigner.length > 0 && (
              <div>
                <h2 className="kds-Heading kds-Heading--m" style={{ marginBottom: '16px' }}>
                  Service Designer
                </h2>
                <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc' }}>
                  {serviceDesigner.map((item, index) => (
                    <li key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
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
