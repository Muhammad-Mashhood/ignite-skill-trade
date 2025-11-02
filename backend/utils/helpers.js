/**
 * Helper utility functions
 */

/**
 * Generate random string
 * @param {Number} length - Length of string
 * @returns {String}
 */
exports.generateRandomString = (length = 10) => {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {String}
 */
exports.formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Calculate time difference in minutes
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Number}
 */
exports.getMinutesDifference = (start, end) => {
  const diffMs = new Date(end) - new Date(start);
  return Math.floor(diffMs / 60000);
};

/**
 * Validate email format
 * @param {String} email - Email address
 * @returns {Boolean}
 */
exports.isValidEmail = (email) => {
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(email);
};

/**
 * Sanitize user input
 * @param {String} input - User input
 * @returns {String}
 */
exports.sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};
