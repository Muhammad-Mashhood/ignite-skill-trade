module.exports = async (req, res) => {
  const results = {};
  
  const check = (name, fn) => {
    try {
      fn();
      results[name] = 'OK';
    } catch (e) {
      results[name] = `FAIL: ${e.message}`;
    }
  };

  check('express', () => require('express'));
  check('mongoose', () => require('mongoose'));
  check('firebase-admin', () => require('firebase-admin'));
  check('cloudinary', () => require('cloudinary'));
  check('dotenv', () => require('dotenv'));
  
  // Try requiring the backend server
  try {
    const app = require('../backend/server');
    results['backend-server-load'] = 'OK';
  } catch (e) {
    results['backend-server-load'] = `FAIL: ${e.message}`;
    results['backend-server-stack'] = e.stack;
  }

  res.status(200).json(results);
};
