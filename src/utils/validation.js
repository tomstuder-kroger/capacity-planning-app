/**
 * Validate quarter name
 */
export const validateQuarterName = (value) => {
  if (!value || value.trim() === '') {
    return 'Required field';
  }
  return null;
};

/**
 * Validate weeks in quarter
 */
export const validateWeeksInQuarter = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'Required field';
  }
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return 'Must be a positive number';
  }
  return null;
};

/**
 * Validate IC name
 */
export const validateICName = (value) => {
  if (!value || value.trim() === '') {
    return 'Required field';
  }
  return null;
};

/**
 * Validate IC role
 */
export const validateICRole = (value) => {
  if (!value || value.trim() === '') {
    return 'Required field';
  }
  return null;
};

/**
 * Validate domain name
 */
export const validateDomainName = (value) => {
  if (!value || value.trim() === '') {
    return 'Required field';
  }
  return null;
};

/**
 * Validate non-negative number (decimals allowed)
 */
export const validateNonNegativeNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null; // Optional field
  }
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    return 'Must be a non-negative number';
  }
  return null;
};

/**
 * Validate non-negative integer
 */
export const validateNonNegativeInteger = (value) => {
  if (value === null || value === undefined || value === '') {
    return null; // Optional field
  }
  const num = Number(value);
  if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
    return 'Must be a whole number (no decimals)';
  }
  return null;
};
