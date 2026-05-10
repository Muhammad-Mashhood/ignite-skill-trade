module.exports = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Root API health check works',
    timestamp: new Date().toISOString()
  });
};
