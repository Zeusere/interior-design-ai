module.exports = async (req, res) => {
  try {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'API is running correctly'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    })
  }
}
