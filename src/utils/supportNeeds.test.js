import { getSupportNeedsByType, getTeamSupportNeeds, generateSupportSummary } from './supportNeeds';

describe('getSupportNeedsByType', () => {
  test('groups projects by support type for active IC', () => {
    const ic = {
      domains: [
        {
          id: '1',
          name: 'Engineering',
          projects: [
            { id: 'p1', title: 'Project A', supportNeeds: ['User Research'] },
            { id: 'p2', title: 'Project B', supportNeeds: ['Service Designer'] },
            { id: 'p3', title: 'Project C', supportNeeds: ['User Research', 'Service Designer'] }
          ]
        }
      ]
    };

    const result = getSupportNeedsByType(ic);

    expect(result.userResearch).toHaveLength(2);
    expect(result.userResearch[0].title).toBe('Project A');
    expect(result.userResearch[1].title).toBe('Project C');
    expect(result.serviceDesigner).toHaveLength(2);
    expect(result.serviceDesigner[0].title).toBe('Project B');
    expect(result.serviceDesigner[1].title).toBe('Project C');
  });

  test('returns empty arrays when no support needs exist', () => {
    const ic = {
      domains: [
        {
          id: '1',
          name: 'Engineering',
          projects: [
            { id: 'p1', title: 'Project A', supportNeeds: [] },
            { id: 'p2', title: 'Project B' }
          ]
        }
      ]
    };

    const result = getSupportNeedsByType(ic);

    expect(result.userResearch).toHaveLength(0);
    expect(result.serviceDesigner).toHaveLength(0);
  });

  test('handles missing supportNeeds field by treating as empty array', () => {
    const ic = {
      domains: [
        {
          id: '1',
          name: 'Engineering',
          projects: [
            { id: 'p1', title: 'Project A' }
          ]
        }
      ]
    };

    const result = getSupportNeedsByType(ic);

    expect(result.userResearch).toHaveLength(0);
    expect(result.serviceDesigner).toHaveLength(0);
  });

  test('sorts projects alphabetically by title', () => {
    const ic = {
      domains: [
        {
          id: '1',
          name: 'Engineering',
          projects: [
            { id: 'p1', title: 'Zebra Project', supportNeeds: ['User Research'] },
            { id: 'p2', title: 'Alpha Project', supportNeeds: ['User Research'] },
            { id: 'p3', title: 'Beta Project', supportNeeds: ['User Research'] }
          ]
        }
      ]
    };

    const result = getSupportNeedsByType(ic);

    expect(result.userResearch[0].title).toBe('Alpha Project');
    expect(result.userResearch[1].title).toBe('Beta Project');
    expect(result.userResearch[2].title).toBe('Zebra Project');
  });

  test('includes domain name with each project', () => {
    const ic = {
      domains: [
        {
          id: '1',
          name: 'Engineering',
          projects: [
            { id: 'p1', title: 'Project A', supportNeeds: ['User Research'] }
          ]
        }
      ]
    };

    const result = getSupportNeedsByType(ic);

    expect(result.userResearch[0].domainName).toBe('Engineering');
  });
});

describe('getTeamSupportNeeds', () => {
  test('aggregates support needs from multiple ICs', () => {
    const ics = [
      {
        id: 'ic1',
        icName: 'Alice',
        domains: [
          {
            id: 'd1',
            name: 'Engineering',
            projects: [
              { id: 'p1', title: 'Project A', supportNeeds: ['User Research'] }
            ]
          }
        ]
      },
      {
        id: 'ic2',
        icName: 'Bob',
        domains: [
          {
            id: 'd2',
            name: 'Design',
            projects: [
              { id: 'p2', title: 'Project B', supportNeeds: ['Service Designer'] }
            ]
          }
        ]
      }
    ];

    const result = getTeamSupportNeeds(ics);

    expect(result.userResearch).toHaveLength(1);
    expect(result.userResearch[0].icName).toBe('Alice');
    expect(result.userResearch[0].projectTitle).toBe('Project A');
    expect(result.serviceDesigner).toHaveLength(1);
    expect(result.serviceDesigner[0].icName).toBe('Bob');
    expect(result.serviceDesigner[0].projectTitle).toBe('Project B');
  });

  test('returns empty arrays for empty IC list', () => {
    const result = getTeamSupportNeeds([]);

    expect(result.userResearch).toHaveLength(0);
    expect(result.serviceDesigner).toHaveLength(0);
  });

  test('returns empty arrays when no ICs have support needs', () => {
    const ics = [
      {
        id: 'ic1',
        icName: 'Alice',
        domains: [
          {
            id: 'd1',
            name: 'Engineering',
            projects: [
              { id: 'p1', title: 'Project A', supportNeeds: [] }
            ]
          }
        ]
      }
    ];

    const result = getTeamSupportNeeds(ics);

    expect(result.userResearch).toHaveLength(0);
    expect(result.serviceDesigner).toHaveLength(0);
  });

  test('includes IC name with each project', () => {
    const ics = [
      {
        id: 'ic1',
        icName: 'Alice Smith',
        domains: [
          {
            id: 'd1',
            name: 'Engineering',
            projects: [
              { id: 'p1', title: 'Project A', supportNeeds: ['User Research'] }
            ]
          }
        ]
      }
    ];

    const result = getTeamSupportNeeds(ics);

    expect(result.userResearch[0].icName).toBe('Alice Smith');
    expect(result.userResearch[0].projectTitle).toBe('Project A');
    expect(result.userResearch[0].domainName).toBe('Engineering');
  });

  test('sorts projects alphabetically within each support type', () => {
    const ics = [
      {
        id: 'ic1',
        icName: 'Alice',
        domains: [
          {
            id: 'd1',
            name: 'Engineering',
            projects: [
              { id: 'p1', title: 'Zebra', supportNeeds: ['User Research'] },
              { id: 'p2', title: 'Alpha', supportNeeds: ['User Research'] },
              { id: 'p3', title: 'Beta', supportNeeds: ['User Research'] }
            ]
          }
        ]
      }
    ];

    const result = getTeamSupportNeeds(ics);

    expect(result.userResearch[0].projectTitle).toBe('Alpha');
    expect(result.userResearch[1].projectTitle).toBe('Beta');
    expect(result.userResearch[2].projectTitle).toBe('Zebra');
  });
});

describe('generateSupportSummary', () => {
  test('generates markdown for IC with support needs', () => {
    const ic = {
      icName: 'Alice',
      domains: [
        {
          id: 'd1',
          name: 'Engineering',
          projects: [
            { id: 'p1', title: 'Project A', supportNeeds: ['User Research'] },
            { id: 'p2', title: 'Project B', supportNeeds: ['Service Designer'] }
          ]
        }
      ]
    };

    const result = generateSupportSummary(ic);

    expect(result).toContain('## Support Needed');
    expect(result).toContain('**User Research:**');
    expect(result).toContain('Project A (Domain: Engineering)');
    expect(result).toContain('**Service Designer:**');
    expect(result).toContain('Project B (Domain: Engineering)');
  });

  test('returns empty string when no support needs exist', () => {
    const ic = {
      icName: 'Alice',
      domains: [
        {
          id: 'd1',
          name: 'Engineering',
          projects: [
            { id: 'p1', title: 'Project A', supportNeeds: [] }
          ]
        }
      ]
    };

    const result = generateSupportSummary(ic);

    expect(result).toBe('');
  });

  test('includes domain names in summary', () => {
    const ic = {
      icName: 'Alice',
      domains: [
        {
          id: 'd1',
          name: 'Engineering',
          projects: [
            { id: 'p1', title: 'Project A', supportNeeds: ['User Research'] }
          ]
        },
        {
          id: 'd2',
          name: 'Design',
          projects: [
            { id: 'p2', title: 'Project B', supportNeeds: ['Service Designer'] }
          ]
        }
      ]
    };

    const result = generateSupportSummary(ic);

    expect(result).toContain('Engineering');
    expect(result).toContain('Design');
  });

  test('handles missing domain names with placeholder', () => {
    const ic = {
      icName: 'Alice',
      domains: [
        {
          id: 'd1',
          projects: [
            { id: 'p1', title: 'Project A', supportNeeds: ['User Research'] }
          ]
        }
      ]
    };

    const result = generateSupportSummary(ic);

    expect(result).toContain('(No Domain)');
  });

  test('handles missing project titles with placeholder', () => {
    const ic = {
      icName: 'Alice',
      domains: [
        {
          id: 'd1',
          name: 'Engineering',
          projects: [
            { id: 'p1', supportNeeds: ['User Research'] }
          ]
        }
      ]
    };

    const result = generateSupportSummary(ic);

    expect(result).toContain('Untitled Project');
  });

  test('returns empty string for null or undefined IC', () => {
    expect(generateSupportSummary(null)).toBe('');
    expect(generateSupportSummary(undefined)).toBe('');
  });

  test('handles IC with no domains', () => {
    const ic = {
      icName: 'Alice'
    };

    const result = generateSupportSummary(ic);

    expect(result).toBe('');
  });

  test('handles IC with empty domains array', () => {
    const ic = {
      icName: 'Alice',
      domains: []
    };

    const result = generateSupportSummary(ic);

    expect(result).toBe('');
  });
});
