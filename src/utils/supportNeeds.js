/**
 * Groups active IC's projects by support type
 * @param {Object} ic - Individual contributor object
 * @returns {Object} - { userResearch: [...projects], serviceDesigner: [...projects] }
 */
export const getSupportNeedsByType = (ic) => {
  if (!ic || !ic.domains) {
    return { userResearch: [], serviceDesigner: [] };
  }

  const userResearch = [];
  const serviceDesigner = [];

  ic.domains.forEach(domain => {
    if (!domain.projects) return;

    domain.projects.forEach(project => {
      const supportNeeds = project.supportNeeds || [];
      const projectWithDomain = {
        ...project,
        domainName: domain.name || '(No Domain)'
      };

      if (supportNeeds.includes('User Research')) {
        userResearch.push(projectWithDomain);
      }
      if (supportNeeds.includes('Service Designer')) {
        serviceDesigner.push(projectWithDomain);
      }
    });
  });

  // Sort alphabetically by title
  const sortByTitle = (a, b) => {
    const titleA = a.title || 'Untitled Project';
    const titleB = b.title || 'Untitled Project';
    return titleA.localeCompare(titleB);
  };

  userResearch.sort(sortByTitle);
  serviceDesigner.sort(sortByTitle);

  return { userResearch, serviceDesigner };
};

/**
 * Aggregates support needs across all ICs in a team
 * @param {Array} ics - Array of individual contributor objects
 * @returns {Object} - { userResearch: [...projects], serviceDesigner: [...projects] }
 */
export const getTeamSupportNeeds = (ics) => {
  if (!Array.isArray(ics) || ics.length === 0) {
    return { userResearch: [], serviceDesigner: [] };
  }

  const userResearch = [];
  const serviceDesigner = [];

  ics.forEach(ic => {
    if (!ic || !ic.domains) return;

    ic.domains.forEach(domain => {
      if (!domain.projects) return;

      domain.projects.forEach(project => {
        const supportNeeds = project.supportNeeds || [];
        const projectWithContext = {
          ...project,
          domainName: domain.name || '(No Domain)',
          icName: ic.icName || 'Unnamed IC'
        };

        if (supportNeeds.includes('User Research')) {
          userResearch.push(projectWithContext);
        }
        if (supportNeeds.includes('Service Designer')) {
          serviceDesigner.push(projectWithContext);
        }
      });
    });
  });

  // Sort alphabetically by title
  const sortByTitle = (a, b) => {
    const titleA = a.title || 'Untitled Project';
    const titleB = b.title || 'Untitled Project';
    return titleA.localeCompare(titleB);
  };

  userResearch.sort(sortByTitle);
  serviceDesigner.sort(sortByTitle);

  return { userResearch, serviceDesigner };
};

/**
 * Generates markdown summary of support needs for an IC
 * @param {Object} ic - Individual contributor object
 * @returns {String} - Formatted markdown string (empty if no support needs)
 */
export const generateSupportSummary = (ic) => {
  if (!ic) {
    return '';
  }

  const { userResearch, serviceDesigner } = getSupportNeedsByType(ic);

  // If no support needs exist, return empty string
  if (userResearch.length === 0 && serviceDesigner.length === 0) {
    return '';
  }

  let summary = '## Support Needs\n\n';

  if (userResearch.length > 0) {
    summary += '### User Research\n\n';
    userResearch.forEach(project => {
      const title = project.title || 'Untitled Project';
      const domain = project.domainName || '(No Domain)';
      summary += `- **${title}** (${domain})\n`;
    });
    summary += '\n';
  }

  if (serviceDesigner.length > 0) {
    summary += '### Service Designer\n\n';
    serviceDesigner.forEach(project => {
      const title = project.title || 'Untitled Project';
      const domain = project.domainName || '(No Domain)';
      summary += `- **${title}** (${domain})\n`;
    });
    summary += '\n';
  }

  return summary.trim() + '\n';
};
